import { ReactNode } from "react";
import "antd/dist/reset.css";
import { SseProvider } from "@/provider/SSEProvider";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <SseProvider>
      <div
        className="bg-cover bg-center"
        style={{ backgroundImage: "url('/images/profileImage.jpg')" }}
      >
        <div className="w-full flex justify-center items-center h-screen py-36 px-20 mx-auto shadow-lg">
          {children}
        </div>
      </div>
    </SseProvider>
  );
}
