"use client";

import { Menu, Layout, Drawer, Button } from "antd";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";

const { Sider } = Layout;

const menuItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: <Link href="/dashboard">Dashboard</Link>,
  },
  {
    key: "orders",
    icon: <ShoppingCartOutlined />,
    label: <Link href="/dashboard/orders">Orders</Link>,
  },
  {
    key: "customers",
    icon: <UserOutlined />,
    label: <Link href="/dashboard/customer">Customers</Link>,
  },
  {
    key: "products",
    icon: <AppstoreOutlined />,
    label: <Link href="/dashboard/products">Products</Link>,
  },
];

const Sidebar = () => {
  const [visible, setVisible] = useState(false);

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
        bodyStyle={{ padding: 0 }}
      >
        <Menu mode="inline" items={menuItems} />
      </Drawer>

      <Sider
        breakpoint="md"
        collapsedWidth="0"
        width={220}
        className="hidden md:block bg-white shadow h-screen fixed left-0 top-0"
        style={{ zIndex: 1000 }}
      >
        <div className="p-4 font-bold text-lg">Admin Panel</div>
        <Menu
          mode="inline"
          items={menuItems}
          defaultSelectedKeys={["dashboard"]}
        />
      </Sider>
    </>
  );
};

export default Sidebar;
