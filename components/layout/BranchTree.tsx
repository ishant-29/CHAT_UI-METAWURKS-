"use client";
import { GitBranch, CornerDownRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useBranch } from "@/hooks/useBranch";
import { Branch } from "@/types/branch";

export default function BranchTree() {
  const pathname = usePathname();
  const conversationId = pathname.split('/').pop() || "";
  const { switchBranch, activeBranch, branches } = useBranch(conversationId);

  return (
    <div>
        <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
            <GitBranch size={12} /> Live Branches
        </h3>
        <div className="space-y-1 ml-3 pl-2 border-l border-[var(--bg-border)]">
           <button
             onClick={() => switchBranch("main")}
             className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs w-full text-left transition-colors ${activeBranch === "main" ? "text-[#3b82f6] bg-blue-50" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
           >
             <span className="w-1.5 h-1.5 flex-shrink-0 rounded-full bg-current"></span>
             <span className="truncate">main</span>
           </button>
           {branches.filter(b => b.name !== 'main').map((b: Branch) => (
               <button
                 key={b._id}
                 onClick={() => switchBranch(b.name)}
                 className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs w-full text-left transition-colors ${activeBranch === b.name ? "text-amber-600 bg-amber-50" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
               >
                 <CornerDownRight size={12} className="opacity-50 flex-shrink-0" />
                 <span className="truncate">{b.name}</span>
               </button>
           ))}
        </div>
    </div>
  );
}
