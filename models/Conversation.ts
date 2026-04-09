import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  title: string;
  activeBranch: string;
  moodTheme: string;
  isShared: boolean;
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    title: { type: String, default: "New Conversation" },
    activeBranch: { type: String, default: "main" },
    moodTheme: { type: String, default: "default" },
    isShared: { type: Boolean, default: false },
    shareToken: { type: String },
  },
  { timestamps: true }
);

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
