"use client";

import { Button, Table, Modal, message, Popconfirm, Space } from "antd";
import { useEffect, useState } from "react";
import { Color, Size } from "@/types/product";
import {
  BackwardOutlined,
  DeleteOutlined,
  PlusOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  deleteColorPermanent,
  deleteColorsPermanent,
  getDeletedColors,
  restoreColor,
  restoreColors,
} from "@/api/product";
import { useRouter } from "next/navigation";

const SizePage = () => {
  const router = useRouter();
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchDeletedColors = async () => {
    setLoading(true);
    try {
      const res = await getDeletedColors();
      setSizes(res.data.data.colors);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedColors();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      const res = await restoreColor(id);
      fetchDeletedColors();
      message.success(res.data.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error);
    }
  };

  const handleBulkRestore = async () => {
    try {
      const res = await restoreColors(selectedRowKeys as string[]);
      setSelectedRowKeys([]);
      fetchDeletedColors();
      toast.success(res.data.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteColorPermanent(id);
      message.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedColors();
    } catch (error: any) {
      message.error(error || "Lỗi khi xóa vĩnh viễn");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deleteColorsPermanent(ids);
      message.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedColors();
    } catch (error: any) {
      message.error(error || "Lỗi khi xóa vĩnh viễn hàng loạt");
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  const columns = [
    {
      title: "Màu",
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
        <Space>
          <Button
            type="link"
            icon={<RollbackOutlined style={{ color: "blue" }} />}
            onClick={() => handleRestore(record.id)}
          />
          <Button
            type="link"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Space>
          <Button
            type="dashed"
            icon={<BackwardOutlined />}
            onClick={() => {
              router.push("/products/colors");
            }}
          >
            Quay lại
          </Button>

          <Popconfirm
            title={`Bạn có chắc muốn xóa ${selectedRowKeys.length} sản phẩm?`}
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
                ? `Xóa ${selectedRowKeys.length} màu`
                : "Xóa"}
            </Button>
          </Popconfirm>

          <Popconfirm
            title={`Khôi phục ${selectedRowKeys.length} màu đã chọn?`}
            onConfirm={handleBulkRestore}
            okText="Khôi phục"
            cancelText="Hủy"
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              type="primary"
              icon={<RollbackOutlined />}
              disabled={selectedRowKeys.length === 0}
            >
              Khôi phục nhiều
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Table
        dataSource={sizes}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        rowSelection={rowSelection}
      />
    </div>
  );
};

export default SizePage;
