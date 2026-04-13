"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Search, BookOpen, Bell, Menu } from "lucide-react";
import ConversationList from "@/components/layout/ConversationList";
import SettingsModal from "./SettingsModal";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();
  const isNewChat = pathname === "/chat";
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);


  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 72 : 224 }}
      className="h-full bg-[#f0f4fa] border-r border-[#dce3ed] flex flex-col shrink-0 overflow-hidden"
    >
      {/* Logo + Menu */}
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

      {/* New Chat */}
      <div className="px-3 mb-4">
        <Link href="/chat">
          <motion.div
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"} w-full px-3 py-2.5 rounded-lg border border-[#c9d4e3] bg-white shadow-sm text-[13px] font-medium text-[#0f172a] hover:bg-[#e8edf5] hover:border-[#93b4e8] transition-all`}
          >
            <Plus size={16} className="shrink-0" />
            {!isCollapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>New Chat</motion.span>}
          </motion.div>
        </Link>
      </div>



      {/* Chat History */}
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

      {/* User Profile */}
      <motion.div 
        whileHover={{ backgroundColor: "#e2e8f0" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSettingsOpen(true)}
        className={`px-3 py-3 border-t border-[#dce3ed] mt-auto flex items-center ${isCollapsed ? "justify-center" : "justify-between"} cursor-pointer transition-colors`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-xs font-bold shadow-sm relative overflow-hidden group flex-shrink-0">
            <span className="relative z-10 transition-transform group-hover:scale-110">U</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-[13px] font-medium text-[#0f172a] whitespace-nowrap"
            >
              User Profile
            </motion.span>
          )}
        </div>
        {!isCollapsed && (
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            className="text-[11px] font-bold text-[#3b82f6] bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-100 shadow-sm pointer-events-none"
          >
            UPGRADE
          </motion.button>
        )}
      </motion.div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </motion.aside>
  );
}
