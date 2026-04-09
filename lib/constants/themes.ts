import { MoodTheme } from "../utils/moodAnalyzer";

export const AURORA_THEMES: Record<MoodTheme, { from: string; via: string; to: string }> = {
  default:   { from: "#93c5fd", via: "#c4b5fd", to: "#7dd3fc" },
  technical: { from: "#7dd3fc", via: "#93c5fd", to: "#a5b4fc" },
  creative:  { from: "#c4b5fd", via: "#f9a8d4", to: "#fda4af" },
  urgent:    { from: "#fda4af", via: "#fdba74", to: "#fcd34d" },
  positive:  { from: "#86efac", via: "#7dd3fc", to: "#a5b4fc" },
};
