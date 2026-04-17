import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Message } from "@/models/Message";

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

    const { messageId, emoji } = await req.json();
    
    // Validate inputs
    if (!messageId || !emoji) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate messageId format
    if (!/^[0-9a-fA-F]{24}$/.test(messageId)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 });
    }

    // Validate emoji (basic check)
    if (typeof emoji !== 'string' || emoji.length > 10) {
      return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
    }

    await dbConnect();
    
    // Verify message belongs to user or is in user's conversation
    const message = await Message.findOne({ _id: messageId, userId: session.user.id });
    if (!message) {
      return NextResponse.json({ error: "Message not found or access denied" }, { status: 404 });
    }

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { reactions: emoji }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("React error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
