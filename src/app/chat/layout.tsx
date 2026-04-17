"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MouseGlow from "@/components/ui/MouseGlow";
import { ModalProvider, useModal } from "@/contexts/ModalContext";

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isModalOpen } = useModal();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-[#eef2f9]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
          <p className="text-[#64748b]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-[#eef2f9] overflow-hidden cursor-none [&_*]:cursor-none">
      <MouseGlow />
      <Sidebar />
      <main className="flex-1 relative h-full">
        {children}
      </main>
    </div>
  );
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </ModalProvider>
  );
}
