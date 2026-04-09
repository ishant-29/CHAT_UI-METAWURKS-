import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Message } from "@/models/Message";

export async function POST(req: NextRequest) {
  const { messageId, emoji } = await req.json();
  await dbConnect();
  
  await Message.findByIdAndUpdate(messageId, {
    $addToSet: { reactions: emoji }
  });

  return NextResponse.json({ success: true });
}
