import React from "react";
import Image from "next/image";

export default function NotFoundPage() {
  return (
    <Image
      src="/images/404.jpeg"
      alt="Page Not Found"
      width={500}
      height={500}
      className="mx-auto mt-20 w-full max-w-md lg:max-w-lg"
    />
  );
}
