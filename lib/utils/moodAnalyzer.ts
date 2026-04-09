import { Message } from "@/types/chat";

export type MoodTheme = "default" | "technical" | "creative" | "urgent" | "positive";

const MOOD_KEYWORDS = {
  technical: ["code", "error", "debug", "function", "api", "database"],
  creative: ["design", "art", "creative", "idea", "imagine", "story", "color"],
  urgent: ["urgent", "asap", "deadline", "critical", "immediately", "quick"],
  positive: ["thanks", "great", "perfect", "awesome", "love", "good", "excellent"],
};

export function analyzeMood(messages: Message[]): MoodTheme {
  const text = messages.map((m) => m.content).join(" ").toLowerCase();
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) return mood as MoodTheme;
  }
  return "default";
}
