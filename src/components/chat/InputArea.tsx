"use client";
import { useState, useRef } from "react";
import { Send, Paperclip, X, FileText, Image as ImageIcon, Mic, Video, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ModelSelector from "./ModelSelector";
import { LLMModel } from "@/lib/constants/models";

interface Props {
  onSend: (content: string, scheduledFor?: Date, useWebSearch?: boolean) => void;
  isLoading: boolean;
  selectedModel: LLMModel;
  onModelChange: (model: LLMModel) => void;
}

export default function InputArea({ onSend, isLoading, selectedModel, onModelChange }: Props) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [acceptFilter, setAcceptFilter] = useState<string>("*/*");
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    onSend(input.trim() || "[Sent with attachment]", undefined, webSearchEnabled);
    setInput("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
      setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const triggerUpload = (filter: string) => {
      setAcceptFilter(filter);
      setShowUploadMenu(false);
      setTimeout(() => fileInputRef.current?.click(), 50);
  };

  return (
    <div className="px-6 pb-5 pt-2 bg-transparent relative z-20">
      <div className="max-w-3xl mx-auto">
        {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 px-1">
                {attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white border border-[#d4dbe8] rounded-lg px-2.5 py-1.5 shadow-sm">
                        {file.type.startsWith("image/") ? <ImageIcon size={14} className="text-[#3b82f6]" /> : <FileText size={14} className="text-[#3b82f6]" />}
                        <span className="text-[12px] font-medium text-[#475569] max-w-[120px] truncate">{file.name}</span>
                        <button onClick={() => removeAttachment(i)} className="text-[#94a3b8] hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 p-0.5 rounded-md">
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
        )}

        <div className="relative flex items-end gap-2 bg-white border border-[#d4dbe8] rounded-2xl px-2 py-1.5 shadow-sm focus-within:border-[#93b4e8] transition-colors">
          <div className="relative">
              <button 
                onClick={() => setShowUploadMenu(!showUploadMenu)}
                className={`p-2.5 rounded-xl transition-colors mb-0.5 ${showUploadMenu ? 'bg-blue-100 text-[#3b82f6]' : 'text-[#64748b] hover:text-[#3b82f6] hover:bg-blue-50'}`}
                title="Attach file"
              >
                  <Paperclip size={18} />
              </button>

              <AnimatePresence>
                  {showUploadMenu && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-12 left-0 w-36 bg-white border border-[#e2e8f0] rounded-xl shadow-lg p-1.5 flex flex-col gap-0.5 z-50"
                     >
                        <button onClick={() => triggerUpload('image/*')} className="flex items-center gap-2.5 text-left px-3 py-2 text-[13px] font-medium text-[#475569] hover:text-[#3b82f6] hover:bg-blue-50/80 rounded-lg transition-colors">
                            <ImageIcon size={14} /> Images
                        </button>
                        <button onClick={() => triggerUpload('.pdf,.txt,.doc,.docx')} className="flex items-center gap-2.5 text-left px-3 py-2 text-[13px] font-medium text-[#475569] hover:text-[#3b82f6] hover:bg-blue-50/80 rounded-lg transition-colors">
                            <FileText size={14} /> Documents
                        </button>
                        <button onClick={() => triggerUpload('video/*')} className="flex items-center gap-2.5 text-left px-3 py-2 text-[13px] font-medium text-[#475569] hover:text-[#3b82f6] hover:bg-blue-50/80 rounded-lg transition-colors">
                            <Video size={14} /> Videos
                        </button>
                     </motion.div>
                  )}
              </AnimatePresence>
          </div>

          <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept={acceptFilter}
              className="hidden" 
              multiple 
          />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            rows={1}
            disabled={isLoading || isListening}
            className="flex-1 bg-transparent text-[#0f172a] placeholder-[#94a3b8] text-[14px] resize-none outline-none max-h-40 py-2.5 ml-1 custom-scrollbar disabled:opacity-50"
          />

          <div className="flex items-center gap-1.5 flex-shrink-0 pb-1 pr-1">
            <button 
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={`p-2 rounded-xl transition-all ${
                  webSearchEnabled 
                  ? "text-[#3b82f6] bg-blue-50" 
                  : "text-[#94a3b8] hover:text-[#3b82f6] hover:bg-blue-50"
              }`}
              title={webSearchEnabled ? "Web search enabled" : "Web search disabled"}
            >
                <Globe size={18} />
            </button>

            <button 
              onClick={() => setIsListening(!isListening)}
              className={`p-2 rounded-xl transition-all ${
                  isListening 
                  ? "text-red-500 bg-red-50 animate-pulse" 
                  : "text-[#94a3b8] hover:text-[#3b82f6] hover:bg-blue-50"
              }`}
              title="Voice input"
            >
                <Mic size={18} />
            </button>

            <button
              onClick={handleSend}
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              className="p-2 text-[#94a3b8] hover:text-[#3b82f6] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>

            <div className="w-px h-6 bg-[#e2e8f0]" />

            <ModelSelector selected={selectedModel} onChange={onModelChange} />
          </div>
        </div>
      </div>
    </div>
  );
}