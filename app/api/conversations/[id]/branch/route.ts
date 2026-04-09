import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import mongoose from "mongoose";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { targetMessageId } = body;

    if (!targetMessageId) {
      return NextResponse.json({ error: "Target messageId is required" }, { status: 400 });
    }

    const parentConvo = await Conversation.findById(id);
    if (!parentConvo) {
      return NextResponse.json({ error: "Parent conversation not found" }, { status: 404 });
    }

    // Try finding by Mongoose Object ID if it matches, otherwise string ID
    const targetQuery = mongoose.Types.ObjectId.isValid(targetMessageId) 
        ? { _id: targetMessageId } 
        : { id: targetMessageId };
        
    const targetMessage = await Message.findOne({ ...targetQuery, conversationId: id });
    
    if (!targetMessage) {
        return NextResponse.json({ error: "Target message not found in this conversation" }, { status: 404 });
    }

    // Capture everything up to and including the target message
    const historyToClone = await Message.find({
        conversationId: id,
        timestamp: { $lte: targetMessage.timestamp }
    }).sort({ timestamp: 1 }).lean();

    // 1. Create branched conversation
    const branchedConvo = await Conversation.create({
        title: `${parentConvo.title} (Branch)`,
        moodTheme: parentConvo.moodTheme,
        activeBranch: parentConvo.activeBranch,
    });

    // 2. Clone messages and re-assign relation
    const clonedMessages = historyToClone.map((msg: any) => {
        const { _id, ...rest } = msg;
        return {
            ...rest,
            conversationId: branchedConvo._id,
            // Re-generate string ID if the frontend relies on exactly mapped UUIDs
            // Mongoose will auto-generate new _ids for the cloned batch
        };
    });

    if (clonedMessages.length > 0) {
        await Message.insertMany(clonedMessages);
    }

    return NextResponse.json({ 
        success: true, 
        newConversationId: branchedConvo._id.toString() 
    });

  } catch (error) {
    console.error("[/api/conversations/branch]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
