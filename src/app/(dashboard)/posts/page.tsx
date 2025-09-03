/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Button,
  Table,
  Popconfirm,
  Space,
  Tag,
  Image,
  Tooltip,
  Input,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  RestOutlined,
} from "@ant-design/icons";
import { getAllPosts, deletePost, deletePosts, getAllTopics } from "@/api/post";
import { useRouter } from "next/navigation";
import { messageApiRef } from "@/components/layout/MessageProvider";
import { Post, Topic } from "@/types/post";
import Link from "antd/es/typography/Link";

const { Option } = Select;

const PostPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState<string | undefined>();
  const [order, setOrder] = useState<"asc" | "desc" | undefined>();
  const [isPublished, setIsPublished] = useState<boolean | undefined>();
  const [search, setSearch] = useState<string | undefined>();
  const [topicId, setTopicId] = useState<string | undefined>();
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

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await getAllPosts({
        page,
        limit,
        sort,
        order,
        is_published: isPublished,
        search,
        topic_id: topicId,
      });
      setPosts(res.data.data.posts || []);
    } catch (error: any) {
      messageApiRef.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, limit, sort, order, isPublished, search, topicId]);

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await deletePost(id);
      messageApiRef.success(res.data.message);
      fetchPosts();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await deletePosts(selectedRowKeys.map((id) => id.toString()));
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchPosts();
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
                ? `Xóa ${selectedRowKeys.length} bài viết`
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

      <div className="flex-wrap gap-4 mb-5 flex justify-between">
        <Input.Search
          placeholder="Tìm kiếm bài viết..."
          allowClear
          onSearch={(value) => {
            setSearch(value || undefined);
            setPage(1);
          }}
          style={{ width: 350 }}
        />

        <div className="flex gap-2">
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => {
              setIsPublished(
                value === undefined ? undefined : value === "true"
              );
              setPage(1);
            }}
          >
            <Select.Option value="true">Đăng tải</Select.Option>
            <Select.Option value="false">Chưa đăng tải</Select.Option>
          </Select>

          <Select
            placeholder="Chủ đề"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => {
              setTopicId(value || undefined);
              setPage(1);
            }}
          >
            {topics.map((t: Topic) => (
              <Option key={t.id} value={t.id}>
                {t.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Sắp xếp theo"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => {
              if (!value) {
                setSort(undefined);
                setOrder(undefined);
              } else {
                const [s, o] = value.split("|");
                setSort(s);
                setOrder(o as "asc" | "desc");
              }
              setPage(1);
            }}
            options={[
              { label: "Tên A-Z", value: "title|asc" },
              { label: "Tên Z-A", value: "title|desc" },
              { label: "Mới đăng tải", value: "published_at|desc" },
              { label: "Bài viết mới nhất", value: "created_at|desc" },
              { label: "Bài viết cũ nhất", value: "created_at|asc" },
            ]}
          />
        </div>
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
