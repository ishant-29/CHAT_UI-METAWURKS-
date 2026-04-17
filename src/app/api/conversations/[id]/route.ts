import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { Branch } from "@/models/Branch";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;
  
  const conversation = await Conversation.findOne({ _id: id, userId: session.user.id });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  const messages = await Message.find({
    conversationId: id,
    userId: session.user.id,
    branchId: conversation.activeBranch,
  }).sort({ timestamp: 1 });
  
  return NextResponse.json({ conversation, messages });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;
  
  await Conversation.findOneAndDelete({ _id: id, userId: session.user.id });
  await Message.deleteMany({ conversationId: id, userId: session.user.id });
  await Branch.deleteMany({ conversationId: id });
  
  return NextResponse.json({ success: true });
}
