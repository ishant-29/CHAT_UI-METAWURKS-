"use client";
import { GitBranch } from "lucide-react";
import { usePathname } from "next/navigation";
import { useBranch } from "@/hooks/useBranch";
import { useState } from "react";

interface Props {
  messageId: string;
}

export default function BranchSelector({ messageId }: Props) {
  const pathname = usePathname();
  const conversationId = pathname.split('/').pop() || "";
  const { createBranch } = useBranch(conversationId);
  const [loading, setLoading] = useState(false);

  const handleBranch = async () => {
    setLoading(true);
    await createBranch(messageId);
    setLoading(false);
  };

  return (
    <button
      disabled={loading || !conversationId || conversationId === "chat"}
      onClick={handleBranch}
      className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[var(--bg-border)] rounded-md text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
      title="Branch conversation from here"
    >
      <GitBranch size={12} />
      <span>{loading ? "Branching..." : "Branch here"}</span>
    </button>
  );
}
