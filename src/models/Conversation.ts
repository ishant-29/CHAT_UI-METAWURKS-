import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
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
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
