"use client";
import { useState } from "react";
import { Branch } from "@/types/branch";

export function useBranch(conversationId: string) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranch] = useState("main");

  const createBranch = async (messageId: string, branchName?: string) => {
    const res = await fetch("/api/branch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, messageId, branchName }),
    });
    const data = await res.json();
    if (data.branch) {
      setBranches((prev) => [...prev, data.branch]);
      setActiveBranch(data.branch.name);
    }
  };

  const switchBranch = (branchName: string) => {
    setActiveBranch(branchName);
  };

  return { branches, setBranches, activeBranch, createBranch, switchBranch };
}
