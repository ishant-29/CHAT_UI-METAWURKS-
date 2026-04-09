"use client";
import { Flame } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Message } from "@/types/chat";

export default function MessageHeatmap() {
    const pathname = usePathname();
    const conversationId = pathname.split('/').pop() || "";
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (conversationId && conversationId !== "chat") {
            fetch(`/api/conversations/${conversationId}`)
                .then(async (res) => {
                    if (!res.ok) return { messages: [] };
                    return res.json();
                })
                .then(data => {
                    if (data && data.messages) setMessages(data.messages);
                })
                .catch(err => console.error("MessageHeatmap fetch error", err));
        }
    }, [conversationId]);
    
    if (!messages.length) return null;

    return (
        <div className="mt-6 border-t border-[var(--bg-border)] pt-4">
            <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                <Flame size={12} className="text-orange-400" /> Impact Heatmap
            </h3>
            <div className="flex items-end gap-[1px] px-2 h-8 w-full">
                {messages.filter(m => m.importance !== undefined).slice(-26).map((msg, i) => {
                    const height = Math.max(20, (msg.importance || 0) * 100) + "%";
                    const hue = (msg.importance || 0) > 0.6 ? 'bg-orange-500' : ((msg.importance || 0) > 0.3 ? 'bg-amber-400' : 'bg-indigo-400');
                    return (
                        <div key={i} className="flex-1 flex items-end h-full relative group cursor-pointer">
                            <div className={`w-full rounded-t-sm opacity-50 group-hover:opacity-100 transition-opacity ${hue}`} style={{ height }} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
