import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const error = searchParams.get("error");
  
  console.error("Auth error:", error);
  
  return NextResponse.json({ 
    error: error || "Authentication failed",
    message: "Please try again or use email/password login"
  }, { status: 200 });
}
