import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { Conversation } from "@/models/Conversation";
import { Groq } from "groq-sdk";
import { searchWeb, shouldUseWebSearch, formatSearchContext, extractCitations } from "@/lib/utils/tavilySearch";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const userId = session.user.id;
    
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      console.error("Invalid userId format:", userId);
      return new Response(JSON.stringify({ error: "Invalid session. Please log out and log back in." }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { content, conversationId, branchId = "main", modelId = "gemini-pro", useWebSearch } = await req.json();

    if (!content?.trim()) {
      return new Response(JSON.stringify({ error: "Message content is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (content.length > 10000) {
      return new Response(JSON.stringify({ error: "Message too long. Maximum 10,000 characters." }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const validModels = ["gemini-pro", "deepseek-v3", "llama-3"];
    if (!validModels.includes(modelId)) {
      return new Response(JSON.stringify({ error: "Invalid model selected" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await dbConnect();

    let convo;
    try {
      if (conversationId) {
        if (!/^[0-9a-fA-F]{24}$/.test(conversationId)) {
          return new Response(JSON.stringify({ error: "Invalid conversation ID" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        convo = await Conversation.findOne({ _id: conversationId, userId });
        if (!convo) {
          return new Response(JSON.stringify({ error: "Conversation not found or access denied" }), { 
            status: 404,
            headers: { "Content-Type": "application/json" }
          });
        }
      } else {
        convo = await Conversation.create({ userId, title: content.slice(0, 40) });
      }
    } catch (err: any) {
      console.error("Conversation error:", err);
      return new Response(JSON.stringify({ error: "Failed to access conversation" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    await Message.create({
      conversationId: convo._id,
      userId,
      branchId,
      content,
      role: "user",
      importance: Math.random() * 0.5,
    });

    let sources: string[] = [];
    let usedWebSearch = false;
    let searchContext = "";

    const shouldSearch = useWebSearch !== false && shouldUseWebSearch(content);
    if (shouldSearch) {
      try {
        const searchData = await searchWeb(content);
        if (searchData) {
          searchContext = formatSearchContext(searchData);
          sources = extractCitations(searchData);
          usedWebSearch = true;
        }
      } catch (err) {
        console.error("Web search error:", err);
      }
    }

    const enhancedContent = searchContext 
      ? `${searchContext}Based on the above web search results, please answer the following question:\n\n${content}`
      : content;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        try {
          if (modelId === "llama-3") {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const completion = await groq.chat.completions.create({
              messages: [{ role: "user", content: enhancedContent }],
              model: "llama-3.1-8b-instant",
              stream: true,
            });

            for await (const chunk of completion) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) {
                fullResponse += text;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            }
          } else {
            let model = "google/gemini-2.0-flash-001";
            if (modelId === "deepseek-v3") model = "deepseek/deepseek-chat";
            else if (modelId === "gemini-pro") model = "google/gemini-2.0-flash-001";

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model,
                messages: [{ role: "user", content: enhancedContent }],
                stream: true,
              })
            });

            if (!response.ok) throw new Error(`API failed: ${response.status}`);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader!.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n").filter(line => line.trim().startsWith("data: "));

              for (const line of lines) {
                const data = line.replace("data: ", "").trim();
                if (data === "[DONE]") continue;
                if (!data) continue;

                try {
                  const parsed = JSON.parse(data);
                  const text = parsed.choices?.[0]?.delta?.content || "";
                  if (text) {
                    fullResponse += text;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          if (usedWebSearch && sources.length > 0) {
            const sourcesText = `\n\n---\n\n📚 **Sources:**\n\n${sources.slice(0, 3).map((url, i) => `${i + 1}. ${url}`).join('\n\n')}`;
            fullResponse += sourcesText;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: sourcesText })}\n\n`));
          }

          const botMessage = await Message.create({
            conversationId: convo._id,
            userId,
            branchId,
            content: fullResponse,
            role: "assistant",
            importance: Math.random(),
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            done: true, 
            messageId: botMessage._id.toString(),
            conversationId: convo._id.toString(),
            sources: usedWebSearch ? sources : undefined,
            usedWebSearch 
          })}\n\n`));

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat stream error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
