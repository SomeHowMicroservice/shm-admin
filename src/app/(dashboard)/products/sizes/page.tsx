/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Table, Modal, message, Popconfirm, Space } from "antd";
import { useEffect, useState } from "react";
import SizeCreateModal from "./components/SizeCreateModal";
import SizeDetailModal from "./components/SizeDetailModal";
import { Size } from "@/types/product";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  RestOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getSizes,
  createSize,
  updateSize,
  deleteSizes,
  deleteSize,
} from "@/api/product";
import { useRouter } from "next/navigation";

const SizePage = () => {
  const router = useRouter();

  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  const fetchSizes = async () => {
    setLoading(true);
    try {
      const res = await getSizes();
      setSizes(res.data.data.sizes);
    } catch (error) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : "Tạo size thất bại";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  const handleCreate = async (data: Size) => {
    try {
      const res = await createSize(data);
      toast.success(res.data.message);
      setCreateOpen(false);
      fetchSizes();
    } catch (error) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : "Tạo size thất bại";
      toast.error(errorMessage);
    }
  };

  const handleUpdate = async (updated: Size) => {
    try {
      const res = await updateSize(updated.id, { name: updated.name });
      setSelectedSize(null);
      toast.success(res.data.message);
      fetchSizes();
    } catch (error) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : "Cập nhật màu thất bại";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteSize(id);
      message.success(res.data.message);
      fetchSizes();
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

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deleteSizes(ids);
      message.success(res.data.message);
      setSelectedRowKeys([]);
      fetchSizes();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error);
    }
  };

  const columns = [
    {
      title: "Tên size",
      dataIndex: "name",
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      render: (_: unknown, record: Size) => {
        const profile = record.created_by?.profile;
        return profile
          ? `${profile.first_name} ${profile.last_name}`
          : record.created_by?.username || "-";
      },
    },
    {
      title: "Người cập nhật",
      dataIndex: "updated_by",
      render: (_: unknown, record: Size) => {
        const profile = record.updated_by?.profile;
        return profile
          ? `${profile.first_name} ${profile.last_name}`
          : record.updated_by?.username || "-";
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      render: (_: unknown, record: Size) =>
        record.created_at
          ? new Date(record.created_at).toLocaleString("vi-VN")
          : "-",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updated_at",
      render: (_: unknown, record: Size) =>
        record.updated_at
          ? new Date(record.updated_at).toLocaleString("vi-VN")
          : "-",
    },
    {
      title: "Thao tác",
      render: (_: unknown, record: Size) => (
        <div className="flex gap-2">
          <Button
            type="link"
            onClick={() => setSelectedSize(record)}
            icon={<EditOutlined />}
          />
          <Popconfirm
            title="Xác nhận xóa?"
            description="Bạn có chắc muốn xóa mục này không?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              icon={<DeleteOutlined style={{ color: "red" }} />}
              style={{ border: "none", boxShadow: "none" }}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between mb-5">
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Tạo mới
          </Button>
          <Popconfirm
            title={`Bạn có chắc muốn xóa ${selectedRowKeys.length} sizes?`}
            onConfirm={() =>
              handleBulkDelete(selectedRowKeys.map((id) => id.toString()))
            }
            okText="Xóa"
            cancelText="Hủy"
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
            >
              {selectedRowKeys.length > 0
                ? `Xóa ${selectedRowKeys.length} size`
                : "Xóa"}
            </Button>
          </Popconfirm>
        </Space>
        <Button
          type="default"
          icon={<RestOutlined style={{ color: "red" }} />}
          onClick={() => router.push("/products/sizes/deleted")}
        >
          Sizes đã xóa
        </Button>
      </div>

      <Table
        dataSource={sizes}
        columns={columns}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
      />

      <SizeCreateModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      {selectedSize && (
        <SizeDetailModal
          size={selectedSize}
          onCancel={() => setSelectedSize(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default SizePage;
