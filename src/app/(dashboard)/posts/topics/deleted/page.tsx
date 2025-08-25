/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Table, Popconfirm, Space } from "antd";
import { useEffect, useState } from "react";
import { Topic } from "@/types/post";
import {
  BackwardOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

import {
  deleteTopicPermanent,
  deleteTopicsPermanent,
  restoreTopic,
  restoreTopics,
  getDeletedTopics,
} from "@/api/post";

import { useRouter } from "next/navigation";
import { messageApiRef } from "@/components/layout/MessageProvider";

const SizePage = () => {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchDeletedTopic = async () => {
    setLoading(true);
    try {
      const res = await getDeletedTopics();
      setTopics(res.data.data.topics);
    } catch (error: any) {
      messageApiRef.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedTopic();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      const res = await restoreTopic(id);
      fetchDeletedTopic();
      messageApiRef.success(res.data.message);
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleBulkRestore = async () => {
    try {
      const res = await restoreTopics(selectedRowKeys as string[]);
      setSelectedRowKeys([]);
      fetchDeletedTopic();
      messageApiRef.success(res.data.message);
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteTopicPermanent(id);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedTopic();
    } catch (error: any) {
      messageApiRef.error(error || "Lỗi khi xóa vĩnh viễn");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deleteTopicsPermanent(ids);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedTopic();
    } catch (error: any) {
      messageApiRef.error(error || "Lỗi khi xóa vĩnh viễn hàng loạt");
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
      title: "Topic",
      dataIndex: "name",
    },
    {
      title: "Slug",
      dataIndex: "slug",
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      render: (_: unknown, record: Topic) => {
        const profile = record.created_by?.profile;
        return profile
          ? `${profile.first_name} ${profile.last_name}`
          : record.created_by?.username || "-";
      },
    },
    {
      title: "Người xóa",
      dataIndex: "updated_by",
      render: (_: unknown, record: Topic) => {
        const profile = record.updated_by?.profile;
        return profile
          ? `${profile.first_name} ${profile.last_name}`
          : record.updated_by?.username || "-";
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      render: (_: unknown, record: Topic) =>
        record.created_at
          ? new Date(record.created_at).toLocaleString("vi-VN")
          : "-",
    },
    {
      title: "Ngày xóa",
      dataIndex: "updated_at",
      render: (_: unknown, record: Topic) =>
        record.updated_at
          ? new Date(record.updated_at).toLocaleString("vi-VN")
          : "-",
    },
    {
      title: "Thao tác",
      render: (_: unknown, record: Topic) => (
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
              router.push("/posts/topics");
            }}
          >
            Quay lại
          </Button>

          <Popconfirm
            title={`Bạn có chắc muốn xóa ${selectedRowKeys.length} topic?`}
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
                ? `Xóa ${selectedRowKeys.length} topic`
                : "Xóa"}
            </Button>
          </Popconfirm>

          <Popconfirm
            title={`Khôi phục ${selectedRowKeys.length} topic đã chọn?`}
            onConfirm={handleBulkRestore}
            okText="Khôi phục"
            cancelText="Hủy"
            disabled={selectedRowKeys.length === 0}
            okButtonProps={{
              danger: true,
            }}
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
        dataSource={topics}
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
