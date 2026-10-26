
"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 print:block print:h-auto print:overflow-visible">
      {/* Sidebar: hidden on print */}
      <div className="print:hidden">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* Main application area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden print:block print:overflow-visible">
        {/* Navbar: hidden on print */}
        <div className="print:hidden">
          <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>

        {/* Page content */}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 print:overflow-visible print:p-0">
          {children}
        </main>
      </div>

      {/* Notifications are hidden when printing */}
      <div className="print:hidden">
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />
      </div>
    </div>
  );
}
