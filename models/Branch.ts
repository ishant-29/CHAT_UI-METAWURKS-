import mongoose, { Schema, Document } from "mongoose";

export interface IBranch extends Document {
  conversationId: mongoose.Types.ObjectId;
  name: string;
  parentBranch: string;
  branchPointMessageId: string;
  createdAt: Date;
}

const BranchSchema = new Schema<IBranch>({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
  name: { type: String, required: true },
  parentBranch: { type: String, default: "main" },
  branchPointMessageId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Branch =
  mongoose.models.Branch ||
  mongoose.model<IBranch>("Branch", BranchSchema);
