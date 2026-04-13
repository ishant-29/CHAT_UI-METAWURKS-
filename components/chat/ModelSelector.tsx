"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle } from "lucide-react";
import { LLM_MODELS, LLMModel } from "@/lib/constants/models";

interface Props {
  selected: LLMModel;
  onChange: (model: LLMModel) => void;
  children?: React.ReactNode;
  align?: "top" | "bottom";
}

export default function ModelSelector({ selected, onChange, children, align = "bottom" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {children ? (
        <div onClick={() => setOpen(!open)} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#3b82f6] bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          LLM
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: align === "bottom" ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: align === "bottom" ? 8 : -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${
              align === "bottom" ? "bottom-full mb-2" : "top-full mt-2"
            } right-0 w-64 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-50 overflow-hidden`}
          >
            <div className="px-3 py-2 border-b border-[#e2e8f0]">
              <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Select Model</span>
            </div>
            <div className="py-1 max-h-[300px] overflow-y-auto custom-scrollbar overscroll-contain">
              {LLM_MODELS.map((model) => {
                const isSelected = model.id === selected.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => { onChange(model); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      isSelected ? "bg-blue-50" : "hover:bg-[#f8fafc]"
                    } ${model.status === 'down' ? "opacity-60" : ""}`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: `${model.color}15` }}
                    >
                      {model.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-medium text-[#0f172a] flex items-center gap-1">
                          {model.name}
                          {model.status === 'down' && <AlertTriangle size={12} className="text-amber-500" />}
                        </span>
                        <span className="text-[9px] px-1 py-0.5 rounded bg-[#f1f5f9] text-[#64748b] font-medium">
                          {model.provider}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#94a3b8] truncate">{model.description}</p>
                    </div>
                    {isSelected && <Check size={14} className="text-[#3b82f6] flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
