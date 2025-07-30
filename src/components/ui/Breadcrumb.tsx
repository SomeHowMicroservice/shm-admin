"use client";

import { Breadcrumb } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");

const BreadcrumbComponent = () => {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const url = "/" + pathSegments.slice(0, index + 1).join("/");

    return {
      title: <Link href={url}>{capitalize(segment)}</Link>,
    };
  });

  return (
    <Breadcrumb
      items={[{ title: <Link href="/">Home</Link> }, ...breadcrumbItems]}
    />
  );
};

export default BreadcrumbComponent;
