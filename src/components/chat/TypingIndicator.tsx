"use client";
import { motion } from "framer-motion";

export default function TypingIndicator({ modelName }: { modelName?: string }) {
  return (
    <motion.div
      className="flex items-start gap-3 my-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
    >
      <div className="w-9 h-9 rounded-full bg-[#e0e7f1] flex-shrink-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-[#3b82f6]">MW</span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"
            animate={{ scale: [0.7, 1.1, 0.7], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
        <span className="text-[13px] text-[#64748b] ml-1">Assistant is processing...</span>
      </div>
    </motion.div>
  );
}
