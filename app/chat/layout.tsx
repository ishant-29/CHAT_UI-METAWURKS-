import Sidebar from "@/components/layout/Sidebar";
import MouseGlow from "@/components/ui/MouseGlow";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
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
