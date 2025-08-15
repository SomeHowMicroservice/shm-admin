/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Table, Popconfirm, Space, message } from "antd";
import { useEffect, useState } from "react";
import CreateColorModal from "./components/CreateColorModal";
import DetailColorModal from "./components/DetailColorModal";
import { Size } from "@/types/product";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  RestOutlined,
} from "@ant-design/icons";
import {
  getColors,
  createColor,
  updateColor,
  deleteColor,
  deleteColors,
} from "@/api/product";
import { useRouter } from "next/navigation";

const SizePage = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Size | null>(null);

  const router = useRouter();

  const fetchColors = async () => {
    setLoading(true);
    try {
      const res = await getColors();
      setSizes(res.data.data.colors);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const handleCreate = async (data: Size) => {
    try {
      const res = await createColor(data);
      message.success(res.data.message);
      setCreateOpen(false);
      fetchColors();
    } catch (error: any) {
      message.error(error);
    }
  };

  const handleUpdate = async (updated: Size) => {
    try {
      const res = await updateColor(updated.id, { name: updated.name });
      setSelectedColor(null);
      message.success(res.data.message);
      fetchColors();
    } catch (error: any) {
      message.error(error);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      const res = await deleteColor(id);
      message.success(res.data.message);
      fetchColors();
    } catch (error: any) {
      message.error(error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await deleteColors(
        selectedRowKeys.map((id) => id.toString())
      );
      message.success(res.data.message);
      setSelectedRowKeys([]);
      fetchColors();
    } catch (error: any) {
      message.error(error);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const columns = [
    {
      title: "Màu",
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
            onClick={() => setSelectedColor(record)}
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
            title={`Bạn có chắc muốn xóa ${selectedRowKeys.length} màu này?`}
            onConfirm={handleBulkDelete}
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
                ? `Xóa ${selectedRowKeys.length} màu`
                : "Xóa"}
            </Button>
          </Popconfirm>
        </Space>

        <Button
          type="default"
          icon={<RestOutlined style={{ color: "red" }} />}
          onClick={() => router.push("/products/colors/deleted")}
          className="border border-red-600"
        >
          Màu đã xóa
        </Button>
      </div>

      <Table
        dataSource={sizes}
        columns={columns}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
      />

      <CreateColorModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      {selectedColor && (
        <DetailColorModal
          color={selectedColor}
          onCancel={() => setSelectedColor(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default SizePage;
