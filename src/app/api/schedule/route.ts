import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { Conversation } from "@/models/Conversation";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate userId format
    if (!/^[0-9a-fA-F]{24}$/.test(session.user.id)) {
      return NextResponse.json({ error: "Invalid session. Please log out and log back in." }, { status: 401 });
    }

    const { content, conversationId, branchId = "main", scheduledFor } = await req.json();
    
    // Validate inputs
    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    if (!scheduledFor) {
      return NextResponse.json({ error: "Scheduled time is required" }, { status: 400 });
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledFor);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return NextResponse.json({ error: "Scheduled time must be in the future" }, { status: 400 });
    }

    // Validate conversationId if provided
    if (conversationId && !/^[0-9a-fA-F]{24}$/.test(conversationId)) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
    }

    await dbConnect();

    let convo = conversationId
      ? await Conversation.findOne({ _id: conversationId, userId: session.user.id })
      : await Conversation.create({ userId: session.user.id, title: content.slice(0, 40) });

    if (!convo) {
      return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 });
    }

    const scheduledMessage = await Message.create({
      conversationId: convo._id,
      userId: session.user.id,
      branchId,
      content,
      role: "user",
      isScheduled: true,
      scheduledFor: scheduledDate,
    });

    return NextResponse.json({
      message: {
        id: scheduledMessage._id.toString(),
        content: scheduledMessage.content,
        role: "user",
        timestamp: scheduledMessage.timestamp,
        isScheduled: true,
        scheduledFor: scheduledMessage.scheduledFor
      },
      conversationId: convo._id.toString(),
    });
  } catch (error) {
    console.error("Schedule error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
