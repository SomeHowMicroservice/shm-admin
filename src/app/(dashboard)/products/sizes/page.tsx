/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Table, Popconfirm, Space } from "antd";
import { useEffect, useState } from "react";
import SizeCreateModal from "./components/SizeCreateModal";
import SizeDetailModal from "./components/SizeDetailModal";
import { Size } from "@/types/product";
import "antd/dist/reset.css";
import { messageApiRef } from "@/components/layout/MessageProvider";
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  RestOutlined,
} from "@ant-design/icons";
import {
  getSizes,
  createSize,
  updateSize,
  deleteSizes,
  deleteSize,
} from "@/api/product";
import { useRouter } from "next/navigation";
import { ColumnsType } from "antd/es/table";

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
    } catch (error: any) {
      messageApiRef.error(error);
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
      messageApiRef?.success(res.data.message);
      console.log(res.data.message);
      setCreateOpen(false);
      fetchSizes();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleUpdate = async (updated: Size) => {
    try {
      const res = await updateSize(updated.id, { name: updated.name });
      setSelectedSize(null);
      messageApiRef.success(res.data.message);
      fetchSizes();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteSize(id);
      messageApiRef.success(res.data.message);
      fetchSizes();
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

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deleteSizes(ids);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchSizes();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const columns: ColumnsType<Size> = [
    {
      title: "Tên size",
      dataIndex: "name",
      align: "center",
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_: unknown, record: Size) => (
        <div className="flex gap-2 justify-center">
          <Button
            type="link"
            onClick={() => {
              setSelectedSize(record);
              console.log(record);
            }}
            icon={<EyeOutlined />}
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
