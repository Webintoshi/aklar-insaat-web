"use client";

import { useState } from "react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

type AdminShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
  };
};

export function AdminShell({ children, user }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-[#17191f]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1 lg:pl-[252px]">
        <Header user={user} onMenu={() => setSidebarOpen(true)} />
        <main className="min-h-[calc(100vh-60px)] px-5 py-7 sm:px-8 lg:px-9 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
