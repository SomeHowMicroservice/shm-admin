/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Table, Popconfirm, Space, Tag, Image, Tooltip } from "antd";
import { useEffect, useState } from "react";
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  RestOutlined,
} from "@ant-design/icons";
import { getAllPosts, deletePost, deletePosts } from "@/api/post";
import { useRouter } from "next/navigation";
import { messageApiRef } from "@/components/layout/MessageProvider";
import { Post } from "@/types/post";
import Link from "antd/es/typography/Link";

const PostPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const router = useRouter();

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await getAllPosts();
      setPosts(res.data.data.posts);
    } catch (error: any) {
      messageApiRef.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await deletePost(id);
      messageApiRef.success(res.data.message);
      fetchTopics();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await deletePosts(selectedRowKeys.map((id) => id.toString()));
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
      title: "Hình ảnh",
      dataIndex: ["thumbnail", "url"],
      render: (thumbnail: string) => (
        <Image
          src={thumbnail}
          alt="Thumbnail"
          className="object-cover rounded"
          width={80}
          height={70}
        />
      ),
      align: "center" as const,
    },
    {
      title: "Tên bài",
      dataIndex: "title",
      align: "center" as const,
      render: (title: string, record: Post) => (
        <Tooltip title={title} className="cursor-pointer">
          <Link
            href={`/posts/${record.id}`}
            className="max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis hover:underline"
          >
            {title}
          </Link>
        </Tooltip>
      ),
    },
    {
      title: "Chủ đề",
      dataIndex: "topic",
      render: (topic: { id: string; name: string }) =>
        topic ? (
          <Tag color="blue">{topic.name}</Tag>
        ) : (
          <Tag color="default">Không có</Tag>
        ),
      align: "center" as const,
    },

    {
      title: "Thao tác",
      render: (_: unknown, record: Post) => (
        <div className="flex gap-2 justify-center">
          <Button
            type="link"
            onClick={() => router.push(`/posts/${record.id}`)}
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
        dataSource={posts}
        columns={columns}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
      />
    </div>
  );
};

export default PostPage;
