import React from "react";
import { SiGoogle, SiMeta } from "react-icons/si";
import { Microscope } from "lucide-react";

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  status?: 'online' | 'down';
}

export const LLM_MODELS: LLMModel[] = [
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    description: "Advanced reasoning and multimodal",
    color: "#4285f4",
    icon: <SiGoogle />,
    status: 'online',
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    description: "Open-source high performance",
    color: "#6366f1",
    icon: <Microscope />,
    status: 'online',
  },
  {
    id: "llama-3",
    name: "Llama 3",
    provider: "Meta",
    description: "Open-source foundation model",
    color: "#0ea5e9",
    icon: <SiMeta />,
    status: 'online',
  },
];

export const DEFAULT_MODEL = LLM_MODELS.find(m => m.id === "gemini-pro") || LLM_MODELS[0];
