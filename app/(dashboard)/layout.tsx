"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { AICopilot } from "@/components/ai/ai-copilot";
import { useAppStore } from "@/lib/store/app.store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f7fafc_0%,_#f1f6f4_100%)]">
      <Sidebar />
      <main
        className={cn(
          "pb-8 transition-all duration-300 md:min-h-screen",
          sidebarOpen ? "md:ml-60" : "md:ml-[68px]"
        )}
      >
        {children}
      </main>
      <AICopilot />
    </div>
  );
}
