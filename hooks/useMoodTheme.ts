"use client";
import { useState, useEffect } from "react";
import { Message } from "@/types/chat";
import { analyzeMood, MoodTheme } from "@/lib/utils/moodAnalyzer";

export function useMoodTheme(messages: Message[]) {
  const [mood, setMood] = useState<MoodTheme>("default");

  useEffect(() => {
    const newMood = analyzeMood(messages);
    if (newMood !== mood) {
      setMood(newMood);
    }
  }, [messages, mood]);

  return mood;
}
