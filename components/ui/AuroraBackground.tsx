"use client";
import { useEffect, useState } from "react";
import { MoodTheme } from "@/lib/utils/moodAnalyzer";
import { AURORA_THEMES } from "@/lib/constants/themes";

export default function AuroraBackground({ mood }: { mood: MoodTheme }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = AURORA_THEMES[mood] || AURORA_THEMES.default;

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Very subtle pastel blobs — light and airy like MetaWurks */}
      <div 
        className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.08] animate-float"
        style={{ backgroundColor: theme.from }}
      />
      <div 
        className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-[0.06] animate-float-delayed"
        style={{ backgroundColor: theme.via }}
      />
      <div 
        className="absolute top-[40%] right-[20%] w-[250px] h-[250px] rounded-full blur-[100px] opacity-[0.05] animate-float-slow"
        style={{ backgroundColor: theme.to }}
      />
    </div>
  );
}
