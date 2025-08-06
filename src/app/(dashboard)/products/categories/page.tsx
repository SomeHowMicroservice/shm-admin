"use client";

import { Button, Popconfirm, Space, Table, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import axiosRequest from "@/config/axios";
import { getCategories } from "@/api/product";
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
      await axiosRequest.delete(`/admin/categories/${id}`);
      message.success("Đã xóa danh mục");
      fetchCategories(pagination.current, pagination.pageSize);
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedRowKeys.map((id) =>
          axiosRequest.delete(`/admin/categories/${id}`)
        )
      );
      message.success("Đã xóa các danh mục đã chọn");
      setSelectedRowKeys([]);
      fetchCategories(pagination.current, pagination.pageSize);
    } catch {
      message.error("Xóa thất bại");
    }
  };

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
        >
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-4">
      <Space className="mb-4" wrap>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push("/products/categories/create")}
        >
          Tạo mới
        </Button>
        {selectedRowKeys.length > 0 && (
          <Popconfirm
            title="Bạn chắc chắn muốn xóa các danh mục đã chọn?"
            onConfirm={handleBulkDelete}
          >
            <Button danger>Xóa đã chọn</Button>
          </Popconfirm>
        )}
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
