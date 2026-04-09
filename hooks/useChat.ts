"use client";
import { useState, useCallback } from "react";
import { Message } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";

export function useChat(initialConversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeConvoId, setActiveConvoId] = useState<string | undefined>(initialConversationId);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, conversationId: activeConvoId }),
      });

      if (!res.ok) throw new Error("API request failed");
      const data = await res.json();

      const botMessage: Message = {
        id: data.message.id,
        content: data.message.content,
        role: "assistant",
        timestamp: new Date(data.message.timestamp),
        importance: data.message.importance,
      };
      setMessages((prev) => [...prev, botMessage]);
      setActiveConvoId(data.conversationId);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [activeConvoId]);

  const branchConversation = useCallback(async (targetMessageId: string) => {
    if (!activeConvoId) return false;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${activeConvoId}/branch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetMessageId }),
      });
      if (!res.ok) throw new Error("Branching failed");
      const data = await res.json();
      setActiveConvoId(data.newConversationId);
      return data.newConversationId;
    } catch (err) {
      setError("Failed to branch conversation.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [activeConvoId]);

  const clearError = () => setError(null);

  return { messages, setMessages, isLoading, error, sendMessage, clearError, activeConvoId, setActiveConvoId, branchConversation };
}
