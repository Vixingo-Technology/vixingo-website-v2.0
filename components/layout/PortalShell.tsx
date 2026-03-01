"use client";

import { PortalSidebar } from "@/components/layout/PortalSidebar";

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <PortalSidebar />
      <main className="lg:pl-[260px] transition-all duration-300">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
