/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Table, Popconfirm, Space } from "antd";
import { useEffect, useState } from "react";
import { Size } from "@/types/product";
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  RestOutlined,
} from "@ant-design/icons";

import {
  getAllTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  deleteTopics,
} from "@/api/post";

import { useRouter } from "next/navigation";
import { messageApiRef } from "@/components/layout/MessageProvider";
import { Topic } from "@/types/post";

const PostPage = () => {
  const [topics, setTopics] = useState<Size[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const router = useRouter();

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await getAllTopics();
      setTopics(res.data.data.topics);
    } catch (error: any) {
      messageApiRef.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleCreate = async (data: Topic) => {
    try {
      const res = await createTopic(data);
      messageApiRef.success(res.data.message);
      setCreateOpen(false);
      fetchTopics();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleUpdate = async (updated: Topic) => {
    try {
      const res = await updateTopic(updated.id, { name: updated.name });
      setSelectedTopic(null);
      messageApiRef.success(res.data.message);
      fetchTopics();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      const res = await deleteTopic(id);
      messageApiRef.success(res.data.message);
      fetchTopics();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await deleteTopics(
        selectedRowKeys.map((id) => id.toString())
      );
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchTopics();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const columns = [
    {
      title: "Topic",
      dataIndex: "name",
      align: "center" as const,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      align: "center" as const,
    },
    {
      title: "Thao tác",
      render: (_: unknown, record: Size) => (
        <div className="flex gap-2 justify-center">
          <Button
            type="link"
            onClick={() => setSelectedTopic(record)}
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
      align: "center" as const,
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between mb-5">
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/posts/create")}
          >
            Tạo mới
          </Button>

          <Popconfirm
            title={`Bạn có chắc muốn xóa ${selectedRowKeys.length} post này?`}
            onConfirm={handleBulkDelete}
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
                ? `Xóa ${selectedRowKeys.length} topic`
                : "Xóa"}
            </Button>
          </Popconfirm>
        </Space>

        <Button
          type="default"
          icon={<RestOutlined style={{ color: "red" }} />}
          onClick={() => router.push("/posts/deleted")}
          className="border border-red-600"
        >
          Post đã xóa
        </Button>
      </div>

      <Table
        dataSource={topics}
        columns={columns}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
      />
    </div>
  );
};

export default PostPage;
