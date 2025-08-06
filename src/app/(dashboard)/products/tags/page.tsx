"use client";

import { Button, Table, Modal } from "antd";
import { useEffect, useState } from "react";
import { Size } from "@/types/product";
import TagCreateModal from "./components/CreateTagModal";
import TagDetailModal from "./components/DetailTagModal";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { getTags, createTag } from "@/api/product";

const SizePage = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>();

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Size | null>(null);

  const fetchSizes = async () => {
    setLoading(true);
    try {
      const res = await getTags();
      setSizes(res.data.data.tags);
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
      const res = await createTag(data);
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

  const handleUpdate = (updated: Size) => {
    setSizes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedTag(null);
    toast.success("Cập nhật thành công");
  };

  const handleDelete = (record: Size) => {
    Modal.confirm({
      title: "Xác nhận xoá",
      content: `Bạn có chắc chắn muốn xoá size "${record.name}" không?`,
      okText: "Xoá",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setSizes((prev) => prev.filter((s) => s.id !== record.id));
          toast.success("Xoá thành công");
        } catch (error) {
          const errorMessage =
            typeof error === "object" && error !== null && "message" in error
              ? (error as { message: string }).message
              : "Tạo size thất bại";
          toast.error(errorMessage);
        }
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  const columns = [
    {
      title: "Tên Tag",
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
            onClick={() => setSelectedTag(record)}
            icon={<EditOutlined />}
          />
          <Button
            type="link"
            onClick={() => handleDelete(record)}
            icon={<DeleteOutlined />}
            danger
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
        >
          Tạo mới
        </Button>
      </div>

      <Table
        dataSource={sizes}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        rowSelection={rowSelection}
      />

      <TagCreateModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      {selectedTag && (
        <TagDetailModal
          tag={selectedTag}
          onCancel={() => setSelectedTag(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default SizePage;
