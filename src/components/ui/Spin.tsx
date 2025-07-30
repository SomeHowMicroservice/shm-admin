"use client";

import { FiLoader } from "react-icons/fi";
import { cn } from "@/config/utils";

interface SpinProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function Spin({
  size = 24,
  color = "#000",
  className,
}: SpinProps) {
  return (
    <FiLoader
      className={cn("animate-spin", className)}
      size={size}
      color={color}
    />
  );
}
