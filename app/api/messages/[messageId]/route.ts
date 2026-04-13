import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Message } from "@/models/Message";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { messageId } = await params;
    await dbConnect();

    // Find the message to get context
    const targetMsg = await Message.findById(messageId);
    if (!targetMsg) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const { conversationId, branchId, role, timestamp } = targetMsg;


    if (role === "user") {
      // Find the immediately following assistant message
      const nextMsg = await Message.findOne({
        conversationId,
        branchId,
        role: "assistant",
        timestamp: { $gte: timestamp }
      }).sort({ timestamp: 1 });

      await Message.findByIdAndDelete(messageId);
      if (nextMsg) {
        await Message.findByIdAndDelete(nextMsg._id);
      }
    } else {
      // Find the immediately preceding user message
      const prevMsg = await Message.findOne({
        conversationId,
        branchId,
        role: "user",
        timestamp: { $lte: timestamp }
      }).sort({ timestamp: -1 });

      await Message.findByIdAndDelete(messageId);
      if (prevMsg) {
        await Message.findByIdAndDelete(prevMsg._id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/messages/delete]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
