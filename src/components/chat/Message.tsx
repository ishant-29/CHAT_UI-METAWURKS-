"use client";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Message as MessageType } from "@/types/chat";
import ReactionBar from "./ReactionBar";
import RemixPanel from "./RemixPanel";
import { GitBranch, Copy, Check, Globe } from "lucide-react";
import TypewriterText from "@/components/ui/TypewriterText";
import { parseMarkdown } from "@/lib/parseMarkdown";
import { useState, useMemo } from "react";

interface Props {
  message: MessageType;
  onReact: (messageId: string, emoji: string) => void;
  onBranch?: (messageId: string) => void;
  modelName?: string;
  modelIcon?: React.ReactNode;
}

export default function Message({ message, onReact, onBranch, modelName, modelIcon }: Props) {
  const isUser = message.role === "user";
  const [showControls, setShowControls] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  const userContent = useMemo(() => parseMarkdown(message.content), [message.content]);
  const botContent = useMemo(() => parseMarkdown(message.content), [message.content]);

  return (
    <motion.div
      className={`flex items-start gap-3 w-full mb-5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-9 h-9 rounded-full bg-[#3b82f6] flex-shrink-0 flex items-center justify-center">
          <span className="text-white text-xs font-bold">You</span>
        </div>
      ) : (
        <div className="w-9 h-9 rounded-full bg-[#e0e7f1] flex-shrink-0 flex items-center justify-center">
          <span className="text-[11px] font-bold text-[#3b82f6]">MW</span>
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        <div
          className={`px-4 py-3 text-[14px] leading-relaxed relative markdown-content ${
            isUser
              ? "bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white rounded-2xl rounded-tr-sm shadow-md"
              : "bg-white text-[#0f172a] rounded-2xl rounded-tl-sm border border-[#e2e8f0] shadow-sm"
          }`}
        >
          {isUser ? (
            <span dangerouslySetInnerHTML={{ __html: userContent }} />
          ) : (
            <span dangerouslySetInnerHTML={{ __html: botContent }} />
          )}
          
          {message.reactions && message.reactions.length > 0 && (
            <div className="absolute -bottom-3 right-2 flex gap-0.5 bg-white border border-[#e2e8f0] rounded-full px-1.5 py-0.5 text-xs shadow-sm">
              {Array.from(new Set(message.reactions)).map(r => <span key={r}>{r}</span>)}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] text-[#94a3b8] px-1 ${isUser ? "text-right" : ""}`}>
            {format(new Date(message.timestamp), "h:mm a")}
          </span>
          {!isUser && message.usedWebSearch && (
            <span className="flex items-center gap-1 text-[10px] text-[#3b82f6] bg-blue-50 px-2 py-0.5 rounded-full">
              <Globe size={10} />
              Web search
            </span>
          )}
        </div>

        {/* Controls */}
        {showControls && (
          <motion.div
            className={`flex flex-wrap items-center gap-2 mt-0.5 ${isUser ? "justify-end" : "justify-start"}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {!isUser && (
              <>
                <ReactionBar messageId={message.id} onReact={(emoji) => onReact(message.id, emoji)} />
                <RemixPanel content={message.content} />
                <button 
                    onClick={() => onBranch?.(message.id)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#e2e8f0] rounded-md text-[11px] font-medium text-[#64748b] hover:text-[#3b82f6] hover:border-[#93b4e8] transition-colors shadow-sm"
                    title="Branch conversation from here"
                >
                    <GitBranch size={13} />
                    Branch
                </button>
              </>
            )}
            
            {/* Copy Button */}
            <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#e2e8f0] rounded-md text-[11px] font-medium text-[#64748b] hover:text-[#3b82f6] hover:border-[#93b4e8] transition-colors shadow-sm"
                title="Copy message"
            >
                {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
