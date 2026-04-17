export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string | Date;
  branchId?: string;
  reactions?: string[];
  remixes?: MessageRemix[];
  importance?: number;
  isScheduled?: boolean;
  scheduledFor?: Date;
  sources?: string[];
  usedWebSearch?: boolean;
}

export interface MessageRemix {
  style: "formal" | "casual" | "bullets";
  content: string;
}

export interface Conversation {
  _id: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  activeBranch: string;
  moodTheme: string;
  isShared: boolean;
  shareToken?: string;
  messageCount?: number;
}
