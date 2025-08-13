"use client";

import { Button, Popconfirm, Space, Table, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { DeleteOutlined, ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { deleteCategories, deleteCategory, getCategories } from "@/api/product";
import { toast } from "react-toastify";
import Link from "antd/es/typography/Link";

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

  const fetchCategories = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data.data.categories);
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
      message.success(res.data.message);
      fetchCategories(pagination.current, pagination.pageSize);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deleteCategories(ids);
      message.success(res.data.message);
      setSelectedRowKeys([]);
      fetchCategories(pagination.current, pagination.pageSize);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error);
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

        <Popconfirm
          title={`Bạn có chắc muốn xóa ${selectedRowKeys.length} danh mục này?`}
          onConfirm={() =>
            handleBulkDelete(selectedRowKeys.map((id) => id.toString()))
          }
          okText="Xóa"
          cancelText="Hủy"
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
    </div>
  );
};

export default CategoryPage;
