import mongoose, { Schema, Document } from "mongoose";

export interface IAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  branchId: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  reactions: string[];
  remixes: { style: string; content: string }[];
  importance: number;
  isScheduled: boolean;
  scheduledFor?: Date;
  attachments?: IAttachment[];
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  branchId: { type: String, default: "main" },
  content: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  timestamp: { type: Date, default: Date.now },
  reactions: [{ type: String }],
  remixes: [{ style: String, content: String }],
  importance: { type: Number, default: 0 },
  isScheduled: { type: Boolean, default: false },
  scheduledFor: { type: Date },
  attachments: [{
    id: { type: String },
    name: { type: String },
    type: { type: String },
    size: { type: Number },
    url: { type: String },
  }],
});

export const Message =
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
