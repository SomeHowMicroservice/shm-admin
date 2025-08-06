import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
