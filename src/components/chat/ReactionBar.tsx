"use client";
import { REACTION_PROMPTS } from "@/lib/constants/reactions";

interface Props {
  messageId: string;
  onReact: (emoji: string) => void;
}

export default function ReactionBar({ messageId, onReact }: Props) {
  const emojis = Object.keys(REACTION_PROMPTS);
  
  return (
    <div className="flex gap-1 bg-white border border-[var(--bg-border)] rounded-full px-2 py-1 shadow-sm relative z-20">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="hover:scale-125 transition-transform p-1 text-sm rounded-full hover:bg-slate-100"
          title={REACTION_PROMPTS[emoji]}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
