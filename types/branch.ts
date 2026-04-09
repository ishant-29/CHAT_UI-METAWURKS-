export interface Branch {
  _id: string;
  conversationId: string;
  name: string;
  parentBranch: string;
  branchPointMessageId: string;
  createdAt: string | Date;
}
