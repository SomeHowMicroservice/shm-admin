import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import BreadcrumbComponent from "@/components/ui/Breadcrumb";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div>
      <div className="flex flex-col min-h-screen w-full py-36 px-20 bg-white">
        <BreadcrumbComponent />
        <div className="flex justify-between bg-white w-full h-screen px-20">
          {children}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
