import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const deletedMessages = await Message.deleteMany({ userId: session.user.id });
    const deletedConversations = await Conversation.deleteMany({ userId: session.user.id });

    return NextResponse.json({ 
      success: true, 
      message: "Chat history cleared successfully",
      deletedMessages: deletedMessages.deletedCount,
      deletedConversations: deletedConversations.deletedCount,
    });
  } catch (error) {
    console.error("[DELETE /api/user/clear-history]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
