"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { useAppStore } from "@/lib/store/app.store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "ml-60" : "ml-[68px]"
        )}
      >
        {children}
      </main>
    </div>
  );
}
