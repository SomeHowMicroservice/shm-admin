"use client";

import { Button, Popconfirm, Space, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import {
  deleteCategories,
  deleteCategory,
  getCategories,
  getCategoryTree,
} from "@/api/product";
import { toast } from "react-toastify";
import Link from "antd/es/typography/Link";
import { messageApiRef } from "@/components/layout/MessageProvider";
import { IoMapOutline } from "react-icons/io5";
import CategoryMindmapModal from "./components/CategoryTreeModal";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const CategoryPage = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isCategoryTreeModalOpen, setIsCategoryTreeModalOpen] =
    useState<boolean>(false);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);

  const fetchCategories = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const res = await getCategories();
      const res2 = await getCategoryTree();
      setCategories(res.data.data.categories);
      setCategoryTree(res2.data.data.categories);
      setPagination({ current: page, pageSize, total: res.data.total });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteCategory(id);
      messageApiRef.success(res.data.message);
      fetchCategories(pagination.current, pagination.pageSize);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deleteCategories(ids);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchCategories(pagination.current, pagination.pageSize);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const columns: ColumnsType<Category> = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      render: (text, record) => (
        <Link onClick={() => router.push(`/products/categories/${record.id}`)}>
          {text}
        </Link>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Popconfirm
          title="Xác nhận xóa danh mục này?"
          onConfirm={() => handleDelete(record.id)}
          okButtonProps={{
            danger: true,
          }}
          icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
        >
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Space className="mb-5">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push("/products/categories/create")}
        >
          Tạo mới
        </Button>

        <Button
          type="primary"
          icon={<IoMapOutline />}
          onClick={() => setIsCategoryTreeModalOpen(true)}
        >
          Xem sơ đồ danh mục
        </Button>

        <Popconfirm
          title={`Bạn có chắc muốn xóa ${selectedRowKeys.length} danh mục này?`}
          onConfirm={() =>
            handleBulkDelete(selectedRowKeys.map((id) => id.toString()))
          }
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{
            danger: true,
          }}
        >
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length === 0}
          >
            {selectedRowKeys.length > 0
              ? `Xóa ${selectedRowKeys.length} danh mục`
              : "Xóa"}
          </Button>
        </Popconfirm>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={categories}
        rowSelection={rowSelection}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => fetchCategories(page, pageSize),
        }}
        scroll={{ x: 500 }}
      />

      <CategoryMindmapModal
        initialData={categoryTree}
        open={isCategoryTreeModalOpen}
        onClose={() => setIsCategoryTreeModalOpen(false)}
      />
    </div>
  );
};

export default CategoryPage;
