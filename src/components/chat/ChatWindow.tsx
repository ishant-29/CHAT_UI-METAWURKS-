"use client";
import { useChat } from "@/hooks/useChat";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { REACTION_PROMPTS } from "@/lib/constants/reactions";
import { DEFAULT_MODEL, LLMModel } from "@/lib/constants/models";
import Message from "./Message";
import InputArea from "./InputArea";
import ModelSelector from "./ModelSelector";
import TypingIndicator from "./TypingIndicator";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ChatWindow({ conversationId }: { conversationId?: string }) {
  const { messages, setMessages, isLoading, sendMessage, activeConvoId, setActiveConvoId, branchConversation } = useChat(conversationId);
  const scrollRef = useAutoScroll([messages, isLoading]);
  const [selectedModel, setSelectedModel] = useState<LLMModel>(DEFAULT_MODEL);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Reset state when "new" query param changes (new chat clicked)
  useEffect(() => {
    const newParam = searchParams.get('new');
    if (newParam && !conversationId) {
      setMessages([]);
      setActiveConvoId(undefined);
      setHasRedirected(false);
      // Clean up the URL
      router.replace('/chat', { scroll: false });
    }
  }, [searchParams, conversationId, setMessages, setActiveConvoId, router]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setActiveConvoId(undefined);
      setHasRedirected(false);
    }
  }, [conversationId, setMessages, setActiveConvoId]);

  useEffect(() => {
    if (activeConvoId && !conversationId && !hasRedirected && messages.length >= 2 && !isLoading) {
      setHasRedirected(true);
      // Update URL without redirect - SPA style
      window.history.pushState({}, '', `/chat/${activeConvoId}`);
    }
  }, [activeConvoId, conversationId, hasRedirected, messages.length, isLoading, setHasRedirected]);

  useEffect(() => {
    if (conversationId && messages.length === 0) {
        fetch(`/api/conversations/${conversationId}`)
            .then(async (res) => {
                if (!res.ok) return { messages: [] };
                return res.json();
            })
            .then(data => {
                if (data && data.messages) setMessages(data.messages);
            })
            .catch(err => console.error(err));
    }
  }, [conversationId, messages.length, setMessages]);

  const handleReact = async (messageId: string, emoji: string) => {
      setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, reactions: [...(m.reactions || []), emoji] } : m
      ));
      await fetch('/api/react', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, emoji })
      });
      const followUp = REACTION_PROMPTS[emoji];
      if (followUp) sendMessage(followUp);
  };

  const handleBranch = async (messageId: string) => {
      const index = messages.findIndex(m => m.id === messageId || (m as any)._id === messageId);
      if (index === -1) return;
      
      setMessages(messages.slice(0, index + 1));
      
      if (branchConversation) {
          const newConvoId = await branchConversation(messageId);
          if (newConvoId) {
             window.history.pushState({}, '', `/chat/${newConvoId}`);
          } else {
             if (setActiveConvoId) setActiveConvoId(undefined);
             window.history.pushState({}, '', '/chat');
          }
      }
  };

  const handleSend = async (content: string, scheduledFor?: Date, useWebSearch?: boolean, attachments?: any[]) => {
      if (scheduledFor) {
          await fetch('/api/schedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content, conversationId: activeConvoId, scheduledFor, modelId: selectedModel.id })
          });
      } else {
          sendMessage(content, selectedModel.id, useWebSearch, attachments);
      }
  };

  const getChatTitle = () => {
      if (messages.length === 0) return "New Chat";
      const firstMsg = messages[0].content;
      return firstMsg.length > 10 ? firstMsg.substring(0, 10).trim() + "..." : firstMsg;
  };

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden bg-[#eef2f9]">
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[450px] rounded-full bg-blue-300/40 blur-[100px] pointer-events-none" />
      <div className="absolute top-[10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-purple-300/30 blur-[90px] pointer-events-none" />

      <header className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-white">
        <div className="flex items-center">
            <img src="/metawurks-logo.svg" alt="MetaWurks" className="h-7 w-auto" />
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <h1 className="font-display text-lg font-bold text-[#0f172a] leading-none">
                {getChatTitle()}
            </h1>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#64748b]">
            <span>Using model:</span>
            <ModelSelector selected={selectedModel} onChange={setSelectedModel} align="top">
                <motion.div 
                    key={selectedModel.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 px-2 py-1 bg-[#f1f5f9] rounded-md text-[#3b82f6] shadow-sm ml-0.5 hover:bg-blue-50 transition-colors"
                >
                    <span className="text-[14px]">{selectedModel.icon}</span>
                    <span className="font-semibold">{selectedModel.name}</span>
                </motion.div>
            </ModelSelector>
        </div>
      </header>

      {messages.length === 0 ? (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <div className="flex flex-col items-center text-center space-y-6 mb-8">
            <img src="/metawurks-logo.svg" alt="MetaWurks" className="h-10 w-auto mb-2 opacity-90 drop-shadow-sm" />
            <h2 className="text-3xl font-display font-semibold text-[#0f172a] tracking-tight">
              Hello{session?.user?.name ? ` ${session.user.name}` : ''}! How can I help you today?
            </h2>
          </div>
          
          <div className="w-full max-w-3xl">
            <InputArea 
              onSend={handleSend} 
              isLoading={isLoading} 
              selectedModel={selectedModel} 
              onModelChange={setSelectedModel}
            />
          </div>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto w-full custom-scrollbar pt-6 pb-2">
            <div className="max-w-5xl mx-auto px-6 w-full pb-8">
              {messages.map((msg, index) => (
                <Message 
                  key={msg.id || (msg as any)._id || index} 
                  message={msg} 
                  onReact={handleReact} 
                  onBranch={handleBranch}
                  modelName={selectedModel.name} 
                  modelIcon={selectedModel.icon} 
                />
              ))}
              
              {isLoading && <TypingIndicator modelName={selectedModel.name} />}
            </div>
          </div>
          
          <InputArea 
            onSend={handleSend} 
            isLoading={isLoading} 
            selectedModel={selectedModel} 
            onModelChange={setSelectedModel}
          />
        </>
      )}
    </div>
  );
}