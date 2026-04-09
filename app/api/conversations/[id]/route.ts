import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { Branch } from "@/models/Branch";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  
  const conversation = await Conversation.findById(id);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  const messages = await Message.find({
    conversationId: id,
    branchId: conversation.activeBranch,
  }).sort({ timestamp: 1 });
  
  return NextResponse.json({ conversation, messages });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  
  await Conversation.findByIdAndDelete(id);
  await Message.deleteMany({ conversationId: id });
  await Branch.deleteMany({ conversationId: id });
  
  return NextResponse.json({ success: true });
}
