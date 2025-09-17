"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/ui/Sidebar";
import "antd/dist/reset.css";
import { SseProvider } from "@/provider/SSEProvider";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <SseProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1 bg-gray-50">
          <div className="flex-1 p-4">{children}</div>
        </div>
      </div>
    </SseProvider>
  );
}
