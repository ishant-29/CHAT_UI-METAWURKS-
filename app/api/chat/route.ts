import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { Conversation } from "@/models/Conversation";
import { getMockResponse } from "@/lib/utils/mockResponses";
import { Groq } from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const { content, conversationId, branchId = "main", modelId = "gemini-pro" } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    await dbConnect();

    // Create or find conversation
    let convo = conversationId
      ? await Conversation.findById(conversationId)
      : await Conversation.create({ title: content.slice(0, 40) });

    if (!convo) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Save user message
    await Message.create({
      conversationId: convo._id,
      branchId,
      content,
      role: "user",
      importance: Math.random() * 0.5,
    });

    let botContent = "";
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    try {
      if (modelId === "llama-3") {
        // Use Groq directly for Llama 3
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content }],
          model: "llama-3.1-8b-instant"
        });
        botContent = completion.choices[0]?.message?.content || getMockResponse(content);
      } else {
        // Map frontend model IDs to OpenRouter model endpoints
        let orModel = "google/gemini-2.0-flash-001"; // Default

        if (modelId === "deepseek-v3") {
          orModel = "deepseek/deepseek-chat";
        } else if (modelId === "gemini-pro") {
          orModel = "google/gemini-2.0-flash-001";
        } else if (modelId === "gpt-4") {
          orModel = "openai/gpt-4o";
        } else if (modelId === "claude-sonnet") {
          orModel = "anthropic/claude-3.7-sonnet";
        } else if (modelId === "grok-2") {
          orModel = "x-ai/grok-3";
        }

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
             model: orModel,
             messages: [{ role: "user", content }]
          })
        });

        if (!res.ok) {
          throw new Error(`OpenRouter API failed with status ${res.status}`);
        }
        const data = await res.json();
        botContent = data.choices?.[0]?.message?.content || getMockResponse(content);
      }
    } catch (apiError) {
      console.error("API error for model", modelId, apiError);
      botContent = "I encountered an API error. Mock fallback: " + getMockResponse(content);
    }

    // Save bot message
    const botMessage = await Message.create({
      conversationId: convo._id,
      branchId,
      content: botContent,
      role: "assistant",
      importance: Math.random(),
    });

    return NextResponse.json({
      message: {
        id: botMessage._id.toString(),
        content: botContent,
        role: "assistant",
        timestamp: botMessage.timestamp,
        importance: botMessage.importance,
      },
      conversationId: convo._id.toString(),
    });
  } catch (error) {
    console.error("[/api/chat]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
