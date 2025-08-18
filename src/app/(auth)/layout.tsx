import { ReactNode } from "react";
import "antd/dist/reset.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div
      className="bg-cover bg-center"
      style={{ backgroundImage: "url('/images/profileImage.jpg')" }}
    >
      <div className="w-full flex justify-center items-center h-screen py-36 px-20 mx-auto shadow-lg">
        {children}
      </div>
    </div>
  );
}
