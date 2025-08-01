"use client";

import { ReactNode } from "react";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/components/ui/Sidebar";
import "@ant-design/v5-patch-for-react-19";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-gray-50">
        <div className="flex-1 p-4">{children}</div>
      </div>
    </div>
  );
}
