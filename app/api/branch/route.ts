import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Branch } from "@/models/Branch";
import { Message } from "@/models/Message";
import { Conversation } from "@/models/Conversation";

export async function POST(req: NextRequest) {
  const { conversationId, messageId, branchName } = await req.json();
  await dbConnect();

  const branch = await Branch.create({
    conversationId,
    name: branchName || `branch-${Date.now()}`,
    parentBranch: "main",
    branchPointMessageId: messageId,
  });

  const messages = await Message.find({ conversationId, branchId: "main" })
    .sort({ timestamp: 1 });
  
  const cutoffIndex = messages.findIndex((m) => m._id.toString() === messageId);
  if (cutoffIndex === -1) {
    return NextResponse.json({ error: "Branch point not found" }, { status: 404 });
  }

  const messagesToCopy = messages.slice(0, cutoffIndex + 1);

  await Message.insertMany(
    messagesToCopy.map((m) => {
      const obj = m.toObject();
      delete obj._id;
      obj.branchId = branch.name;
      return obj;
    })
  );

  await Conversation.findByIdAndUpdate(conversationId, { activeBranch: branch.name });

  return NextResponse.json({ branch });
}
