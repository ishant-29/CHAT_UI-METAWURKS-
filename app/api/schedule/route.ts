import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { Conversation } from "@/models/Conversation";

export async function POST(req: NextRequest) {
  const { content, conversationId, branchId = "main", scheduledFor } = await req.json();
  await dbConnect();

  let convo = conversationId
    ? await Conversation.findById(conversationId)
    : await Conversation.create({ title: content.slice(0, 40) });

  const scheduledMessage = await Message.create({
    conversationId: convo._id,
    branchId,
    content,
    role: "user",
    isScheduled: true,
    scheduledFor: new Date(scheduledFor),
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
}
