"use client";

import { Menu, Layout, Drawer, Button, message, Modal } from "antd";
import { useState } from "react";
import Image from "next/image";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { IoIosResize, IoIosColorFilter } from "react-icons/io";
import { IoPricetagsOutline } from "react-icons/io5";
import { MdOutlineCategory } from "react-icons/md";
import { AiOutlineProduct } from "react-icons/ai";
import { TfiLayoutListPost } from "react-icons/tfi";
import { useRouter } from "next/navigation";
import { logOutUser } from "@/services/auth";
import "@ant-design/v5-patch-for-react-19";

const { Sider } = Layout;

const Sidebar = () => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await logOutUser();
      message.success(res.data.message);
      router.push("/login");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const confirmLogout = () => {
    Modal.confirm({
      title: "Xác nhận đăng xuất",
      content: "Bạn có chắc chắn muốn đăng xuất không?",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      onOk: handleLogout,
      centered: true,
      okButtonProps: {
        danger: true,
      },
    });
  };

  // Handle menu click events
  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "log-out") {
      confirmLogout();
    }
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/">Dashboard</Link>,
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: <Link href="/orders">Orders</Link>,
    },
    {
      key: "customers",
      icon: <UserOutlined />,
      label: <Link href="/customer">Customers</Link>,
    },
    {
      key: "posts",
      icon: <TfiLayoutListPost />,
      label: <span>Post</span>,
      children: [
        {
          key: "posts-list",
          icon: <TfiLayoutListPost />,
          label: <Link href="/posts">Posts</Link>,
        },
        {
          key: "post-topic",
          icon: <MdOutlineCategory />,
          label: <Link href="/posts/topics">Topic</Link>,
        },
      ],
    },
    {
      key: "products",
      icon: <AiOutlineProduct />,
      label: <span>Product</span>,
      children: [
        {
          key: "products-list",
          icon: <AiOutlineProduct />,
          label: <Link href="/products">Products</Link>,
        },
        {
          key: "product-category",
          icon: <MdOutlineCategory />,
          label: <Link href="/products/categories">Category</Link>,
        },
        {
          key: "product-size",
          icon: <IoIosResize />,
          label: <Link href="/products/sizes">Size</Link>,
        },
        {
          key: "product-color",
          icon: <IoIosColorFilter />,
          label: <Link href="/products/colors">Color</Link>,
        },
        {
          key: "product-tag",
          icon: <IoPricetagsOutline />,
          label: <Link href="/products/tags">Tag</Link>,
        },
      ],
    },
    {
      key: "log-out",
      icon: <LogoutOutlined />,
      label: <span className="text-red-500 hover:text-red-600">Đăng xuất</span>,
    },
  ];

  return (
    <>
      <div className="md:hidden p-4 bg-white shadow">
        <Button icon={<MenuOutlined />} onClick={() => setVisible(true)} />
      </div>

      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setVisible(false)}
        open={visible}
        className="p-0"
      >
        <Menu mode="inline" items={menuItems} onClick={handleMenuClick} />
      </Drawer>

      <Sider
        breakpoint="md"
        collapsedWidth="0"
        width={220}
        className="hidden md:block bg-white shadow fixed left-0 top-0"
        style={{ zIndex: 1000 }}
      >
        <div className="flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={150}
            height={50}
            className="p-4"
            objectFit="center"
          />
        </div>
        <Menu
          mode="inline"
          items={menuItems}
          defaultSelectedKeys={["dashboard"]}
          className="bg-gray-50"
          onClick={handleMenuClick}
        />
      </Sider>
    </>
  );
};

export default Sidebar;
