import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { content } = await req.json();
  await new Promise((r) => setTimeout(r, 800));

  const remixes = [
    {
      style: "formal",
      content: `In a formal context: ${content.split(".")[0]}. This represents a structured approach to the matter at hand.`,
    },
    {
      style: "casual",
      content: `Hey so basically — ${content.toLowerCase().replace(/\.$/, "")}... pretty wild right?`,
    },
    {
      style: "bullets",
      content: content
        .split(". ")
        .filter(Boolean)
        .map((s: string) => `• ${s.trim()}`)
        .join("\n"),
    },
  ];

  return NextResponse.json({ remixes });
}
