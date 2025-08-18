/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Table, Space, Popconfirm } from "antd";
import { useEffect, useState } from "react";
import { Size, Tags } from "@/types/product";
import TagCreateModal from "./components/CreateTagModal";
import TagDetailModal from "./components/DetailTagModal";
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  RestOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getTags,
  createTag,
  updateTag,
  deleteTags,
  deleteTag,
} from "@/api/product";
import { useRouter } from "next/navigation";
import { messageApiRef } from "@/components/layout/MessageProvider";

const TagPage = () => {
  const router = useRouter();
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Size | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await getTags();
      setSizes(res.data.data.tags);
    } catch (error: any) {
      messageApiRef.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async (data: Size) => {
    try {
      const res = await createTag(data);
      toast.success(res.data.message);
      setCreateOpen(false);
      fetchTags();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleUpdate = async (updated: Tags) => {
    try {
      const res = await updateTag(updated.id, { name: updated.name });
      setSelectedTag(null);
      messageApiRef.success(res.data.message);
      fetchTags();
    } catch (error) {
      messageApiRef.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteTag(id);
      messageApiRef.success(res.data.message);
      fetchTags();
    } catch (error) {
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
      const res = await deleteTags(ids);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchTags();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const columns = [
    {
      title: "Tên Tag",
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
            onClick={() => setSelectedTag(record)}
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
      <div className="flex justify-between items-center mb-4">
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Tạo mới
          </Button>
          <Popconfirm
            title={`Bạn có chắc muốn xóa ${selectedRowKeys.length} tags?`}
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
                ? `Xóa ${selectedRowKeys.length} tags`
                : "Xóa"}
            </Button>
          </Popconfirm>
        </Space>
        <Button
          type="default"
          icon={<RestOutlined style={{ color: "red" }} />}
          onClick={() => router.push("/products/tags/deleted")}
        >
          Tags đã xóa
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

export default TagPage;
