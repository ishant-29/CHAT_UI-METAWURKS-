import React from "react";
import { SiOpenai, SiAnthropic, SiGoogle, SiMeta, SiX } from "react-icons/si";
import { Microscope } from "lucide-react";

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

export const LLM_MODELS: LLMModel[] = [
  {
    id: "gpt-4",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Most capable model for complex tasks",
    color: "#10a37f",
    icon: <SiOpenai />,
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "Anthropic",
    description: "Balanced speed and intelligence",
    color: "#d97706",
    icon: <SiAnthropic />,
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    description: "Advanced reasoning and multimodal",
    color: "#4285f4",
    icon: <SiGoogle />,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    description: "Open-source high performance",
    color: "#6366f1",
    icon: <Microscope />,
  },
  {
    id: "llama-3",
    name: "Llama 3",
    provider: "Meta",
    description: "Open-source foundation model",
    color: "#0ea5e9",
    icon: <SiMeta />,
  },
  {
    id: "grok-2",
    name: "Grok 2",
    provider: "xAI",
    description: "Real-time knowledge and wit",
    color: "#ef4444",
    icon: <SiX />,
  },
];

export const DEFAULT_MODEL = LLM_MODELS[0];
