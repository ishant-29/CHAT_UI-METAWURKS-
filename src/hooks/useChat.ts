"use client";
import { useState, useCallback } from "react";
import { Message } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";

export function useChat(initialConversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeConvoId, setActiveConvoId] = useState<string | undefined>(initialConversationId);

  const sendMessage = useCallback(async (content: string, modelId: string = "gemini-pro", useWebSearch: boolean = true) => {
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

    const assistantMessageId = uuidv4();
    let hasAddedPlaceholder = false;

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content, 
          conversationId: activeConvoId, 
          modelId,
          useWebSearch 
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(line => line.trim().startsWith("data: "));

        for (const line of lines) {
          const data = line.replace("data: ", "").trim();
          if (!data) continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.text) {
              accumulatedText += parsed.text;
              
              if (!hasAddedPlaceholder) {
                const assistantMessage: Message = {
                  id: assistantMessageId,
                  content: accumulatedText,
                  role: "assistant",
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
                hasAddedPlaceholder = true;
              } else {
                setMessages((prev) => 
                  prev.map((m) => 
                    m.id === assistantMessageId 
                      ? { ...m, content: accumulatedText }
                      : m
                  )
                );
              }
            }

            if (parsed.done) {
              setMessages((prev) => 
                prev.map((m) => 
                  m.id === assistantMessageId 
                    ? { 
                        ...m, 
                        id: parsed.messageId,
                        sources: parsed.sources,
                        usedWebSearch: parsed.usedWebSearch 
                      }
                    : m
                )
              );
              setActiveConvoId(parsed.conversationId);
            }

            if (parsed.error) {
              setError("Something went wrong");
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (err) {
      setError("Something went wrong");
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
      if (!res.ok) throw new Error("Branch failed");
      const data = await res.json();
      setActiveConvoId(data.newConversationId);
      return data.newConversationId;
    } catch (err) {
      setError("Failed to branch");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [activeConvoId]);

  const clearError = () => setError(null);

  return { 
    messages, 
    setMessages, 
    isLoading, 
    error, 
    sendMessage, 
    clearError, 
    activeConvoId, 
    setActiveConvoId, 
    branchConversation
  };
}
