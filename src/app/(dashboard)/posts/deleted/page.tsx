/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Button, Input, Popconfirm, Select, Space, Tag, Tooltip } from "antd";
import Link from "antd/es/typography/Link";
import { Image } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import {
  BackwardOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { messageApiRef } from "@/components/layout/MessageProvider";
import {
  deletePostPermanent,
  deletePostsPermanent,
  getAllTopics,
  getDeletedPosts,
  restorePost,
  restorePosts,
} from "@/api/post";
import { Post, Topic } from "@/types/post";

const { Option } = Select;

export default function DeletedPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState<string | undefined>();
  const [order, setOrder] = useState<"asc" | "desc" | undefined>();
  const [isPublished, setIsPublished] = useState<boolean | undefined>();
  const [search, setSearch] = useState<string | undefined>();
  const [topicId, setTopicId] = useState<string | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  const fetchDeletedPosts = async () => {
    try {
      setLoading(true);
      const res = await getDeletedPosts({
        page,
        limit,
        sort,
        order,
        is_published: isPublished,
        search,
        topic_id: topicId,
      });
      const postsList = res?.data?.data?.posts;
      setPosts(Array.isArray(postsList) ? postsList : []);
      messageApiRef.success(res.data.message);
    } catch (error: any) {
      messageApiRef.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedPosts();
  }, [page, limit, sort, order, isPublished, search, topicId]);

  useEffect(() => {
    fetchTopics();
  }, []);

  const router = useRouter();

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await restorePost(id);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedPosts();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleBulkRestore = async (ids: string[]) => {
    try {
      const res = await restorePosts(ids);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedPosts();
    } catch (error: any) {
      messageApiRef.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deletePostPermanent(id);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedPosts();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deletePostsPermanent(ids);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedPosts();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const columns: ColumnsType<Post> = [
    {
      title: "Ảnh",
      dataIndex: ["thumbnail", "url"],
      key: "thumbnail",
      render: (url: string) => (
        <Image
          src={url}
          alt="thumbnail"
          width={68}
          height={68}
          preview={{ mask: <span>Xem</span> }}
          style={{ objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    {
      title: "Tên bài viết",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => (
        <Tooltip title={title} className="cursor-pointer">
          <Link
            href={`/posts/${record.id}/deleted`}
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
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<RollbackOutlined style={{ color: "blue" }} />}
            style={{ border: "none", boxShadow: "none" }}
            onClick={() => handleRestore(record.id)}
          />

          <Popconfirm
            title="Bạn có chắc muốn xóa bài viết này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              danger: true,
            }}
          >
            <Button type="link" danger>
              <DeleteOutlined style={{ fontSize: 18 }} />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex justify-between mb-5">
        <Space>
          <Button
            type="dashed"
            icon={<BackwardOutlined />}
            onClick={() => router.push("/posts")}
          >
            Quay lại
          </Button>

          <Popconfirm
            title={`Bạn có chắc muốn xóa ${selectedRowKeys.length} bài viết`}
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
                ? `Xóa ${selectedRowKeys.length} bài viết`
                : "Xóa"}
            </Button>
          </Popconfirm>

          <Popconfirm
            title={`Bạn có chắc muốn khôi phục ${selectedRowKeys.length} bài viết này?`}
            onConfirm={() =>
              handleBulkRestore(selectedRowKeys.map((id) => id.toString()))
            }
            okText="Khôi phục"
            cancelText="Hủy"
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              type="primary"
              icon={<RollbackOutlined />}
              disabled={selectedRowKeys.length === 0}
            >
              {selectedRowKeys.length > 0
                ? `Khôi phục ${selectedRowKeys.length} bài viết`
                : "Khôi phục"}
            </Button>
          </Popconfirm>
        </Space>
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
        rowKey="id"
        columns={columns}
        dataSource={posts}
        loading={loading}
        pagination={{ pageSize: 10 }}
        rowSelection={rowSelection}
      />
    </div>
  );
}
