"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, Trash2 } from "lucide-react";
import { Conversation } from "@/types/chat";
import { motion } from "framer-motion";

interface Props {
  isCollapsed?: boolean;
}

export default function ConversationList({ isCollapsed }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/conversations")
      .then(async (res) => {
        if (!res.ok) return { conversations: [] };
        return res.json();
      })
      .then((data) => {
        if (data && data.conversations) setConversations(data.conversations);
      })
      .catch((err) => console.error("Error fetching conversations:", err));
  }, [pathname]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c._id !== id));
    if (pathname === `/chat/${id}`) router.push("/chat");
  };

  return (
    <div className="space-y-0.5">
      {conversations.map((convo) => {
        const isActive = pathname === `/chat/${convo._id}`;
        return (
          <Link
            key={convo._id}
            href={`/chat/${convo._id}`}
            className={`group flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2 rounded-lg text-[13px] transition-all ${
              isActive
                ? "bg-white text-[#0f172a] shadow-sm"
                : "text-[#475569] hover:bg-white hover:text-[#0f172a]"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5"} overflow-hidden`}>
              <MessageCircle size={14} className={`${isActive ? "text-[#3b82f6]" : ""} shrink-0`} />
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="truncate"
                >
                  {convo.title}
                </motion.span>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={(e) => handleDelete(e, convo._id)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-0.5"
              >
                <Trash2 size={12} />
              </button>
            )}
          </Link>
        );
      })}
      {conversations.length === 0 && !isCollapsed && (
        <p className="text-[12px] text-[#94a3b8] px-3 italic">No chats yet</p>
      )}
    </div>
  );
}
