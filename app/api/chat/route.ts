import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { Conversation } from "@/models/Conversation";
import { getMockResponse } from "@/lib/utils/mockResponses";

export async function POST(req: NextRequest) {
  try {
    const { content, conversationId, branchId = "main" } = await req.json();

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

    // Simulate thinking delay (1-2 seconds)
    const delay = 1000 + Math.random() * 1000;
    await new Promise((res) => setTimeout(res, delay));

    const botContent = getMockResponse(content);

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
