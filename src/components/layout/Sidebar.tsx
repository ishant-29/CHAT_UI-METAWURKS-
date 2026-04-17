"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Menu } from "lucide-react";
import ConversationList from "@/components/layout/ConversationList";
import SettingsModal from "./SettingsModal";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useModal } from "@/contexts/ModalContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isNewChat = pathname === "/chat";
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();
  const { setIsModalOpen } = useModal();

  const handleSettingsChange = (open: boolean) => {
    setSettingsOpen(open);
    setIsModalOpen(open);
  };

  const handleNewChat = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to /chat with a timestamp to force remount
    router.push(`/chat?new=${Date.now()}`);
  };

  const getUserInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 72 : 224 }}
      className="h-full bg-[#f0f4fa] border-r border-[#dce3ed] flex flex-col shrink-0 overflow-hidden"
    >
      <div className={`px-4 py-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed && (
          <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
          >
            <img src="/metawurks-logo.svg" alt="MetaWurks" className="h-7 w-auto" />
          </motion.div>
        )}
        <motion.button 
            whileHover={{ scale: 1.1, rotate: isCollapsed ? 0 : 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[#64748b] hover:text-[#0f172a] transition-colors p-1"
        >
          <Menu size={18} />
        </motion.button>
      </div>

      <div className="px-3 mb-4">
        <motion.div
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewChat}
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"} w-full px-3 py-2.5 rounded-lg border border-[#c9d4e3] bg-white shadow-sm text-[13px] font-medium text-[#0f172a] hover:bg-[#e8edf5] hover:border-[#93b4e8] transition-all cursor-pointer`}
        >
          <Plus size={16} className="shrink-0" />
          {!isCollapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>New Chat</motion.span>}
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-3">
        {!isCollapsed && (
          <div className="px-2 mb-2">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider"
            >
              Chat History
            </motion.span>
          </div>
        )}
        <ConversationList isCollapsed={isCollapsed} />
      </div>

      <div className="border-t border-[#dce3ed] mt-auto">
        <motion.div 
          whileHover={{ backgroundColor: "#e2e8f0" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSettingsChange(true)}
          className={`px-3 py-3 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} cursor-pointer transition-colors`}
        >
          <div className="flex items-center gap-2.5">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || "User"} 
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-xs font-bold shadow-sm relative overflow-hidden group flex-shrink-0">
                <span className="relative z-10 transition-transform group-hover:scale-110">
                  {getUserInitials()}
                </span>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <span className="text-[13px] font-medium text-[#0f172a] whitespace-nowrap">
                  {session?.user?.name || "User"}
                </span>
                <span className="text-[10px] text-[#64748b]">
                  {session?.user?.email}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={handleSettingsChange} />
    </motion.aside>
  );
}
