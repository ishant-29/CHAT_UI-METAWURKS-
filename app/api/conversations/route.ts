import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";

export async function GET() {
  try {
    await dbConnect();
    const conversations = await Conversation.find().sort({ updatedAt: -1 }).limit(50);
    return NextResponse.json({ conversations });
  } catch (err: any) {
    console.error("GET /api/conversations error", err);
    return NextResponse.json({ error: err.message || "Internal Error", conversations: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { title } = await req.json();
    const conversation = await Conversation.create({ title: title || "New Conversation" });
    return NextResponse.json({ conversation });
  } catch (err: any) {
    console.error("POST /api/conversations error", err);
    return NextResponse.json({ error: err.message || "Internal Error" }, { status: 500 });
  }
}
