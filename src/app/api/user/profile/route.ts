import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select("-passwordHash").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[GET /api/user/profile]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, image } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 });
    }

    await dbConnect();
    const updateData: any = { name: name.trim() };
    
    if (image) {
      updateData.image = image;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.error("[PATCH /api/user/profile]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const { Conversation } = await import("@/models/Conversation");
    const { Message } = await import("@/models/Message");
    
    await Message.deleteMany({ userId: session.user.id });
    await Conversation.deleteMany({ userId: session.user.id });
    await User.findByIdAndDelete(session.user.id);

    return NextResponse.json({ 
      success: true, 
      message: "Account deleted successfully" 
    });
  } catch (error) {
    console.error("[DELETE /api/user/profile]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
