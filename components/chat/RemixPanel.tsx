"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { RefreshCw, Copy, CheckCircle } from "lucide-react";

interface Remix {
  style: string;
  content: string;
}

interface Props {
  content: string;
}

export default function RemixPanel({ content }: Props) {
  const [remixes, setRemixes] = useState<Remix[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const fetchRemixes = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    
    setLoading(true);
    setOpen(true);
    try {
      const res = await fetch("/api/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      setRemixes(data.remixes || []);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="relative">
      <button 
        onClick={fetchRemixes} 
        disabled={loading}
        className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[var(--bg-border)] rounded-md text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
      >
        <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        <span>{loading ? "Remixing..." : "Remix"}</span>
      </button>

      <AnimatePresence>
        {open && remixes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-0 top-full mt-2 grid grid-cols-3 gap-3 w-[500px] max-w-[80vw] z-30"
          >
            {remixes.map((remix, i) => (
              <motion.div
                key={remix.style}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                className="bg-white border border-[var(--bg-border)] rounded-xl p-3 shadow-xl flex flex-col"
              >
                <div className="flex justify-between items-center mb-2 border-b border-[var(--bg-border)] pb-2">
                    <span className="text-xs font-semibold capitalize text-[#3b82f6]">{remix.style}</span>
                    <button onClick={() => handleCopy(remix.content, i)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        {copied === i ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                </div>
                <p className="text-[11px] text-[var(--text-primary)] leading-relaxed italic flex-1">
                    {remix.content}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
