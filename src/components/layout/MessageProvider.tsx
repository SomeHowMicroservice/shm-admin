/* eslint-disable @typescript-eslint/no-explicit-any */
// components/MessageProvider.tsx
"use client";
import { message } from "antd";
import { ReactNode } from "react";

export let messageApiRef: any;

export default function MessageProvider({ children }: { children: ReactNode }) {
  const [messageApi, contextHolder] = message.useMessage();
  messageApiRef = messageApi;

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
}
