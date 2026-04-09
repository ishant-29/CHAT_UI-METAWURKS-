"use client";
import { motion } from "framer-motion";
import { MoodTheme } from "@/lib/utils/moodAnalyzer";
import { AURORA_THEMES } from "@/lib/constants/themes";

export default function AnimatedAvatar({ mood = "default", isThinking = false }: { mood?: string | MoodTheme, isThinking?: boolean }) {
  const theme = AURORA_THEMES[mood as MoodTheme] || AURORA_THEMES.default;

  return (
    <motion.div 
        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
        animate={{ scale: isThinking ? [1, 1.05, 1] : 1 }}
        transition={{ repeat: isThinking ? Infinity : 0, duration: 1.5 }}
    >
        <div 
            className="absolute inset-0 opacity-80"
            style={{
                background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`
            }} 
        />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white relative z-10">
          <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
        </svg>
    </motion.div>
  );
}
