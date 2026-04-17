import ChatWindow from "@/components/chat/ChatWindow";

export default async function ExistingChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ChatWindow conversationId={resolvedParams.id} />;
}
