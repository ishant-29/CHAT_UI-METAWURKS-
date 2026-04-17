import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate userId format
    if (!/^[0-9a-fA-F]{24}$/.test(session.user.id)) {
      return NextResponse.json({ error: "Invalid session. Please log out and log back in." }, { status: 401 });
    }

    await dbConnect();
    const conversations = await Conversation.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();
    return NextResponse.json({ conversations });
  } catch (err: any) {
    console.error("GET /api/conversations error", err);
    return NextResponse.json({ error: "Internal Error", conversations: [] }, { status: 500 });
  }
}

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

    await dbConnect();
    const { title } = await req.json();
    
    // Validate title length
    const sanitizedTitle = title ? title.slice(0, 100) : "New Conversation";
    
    const conversation = await Conversation.create({ 
      userId: session.user.id,
      title: sanitizedTitle
    });
    return NextResponse.json({ conversation });
  } catch (err: any) {
    console.error("POST /api/conversations error", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
