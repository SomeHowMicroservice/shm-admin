/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Switch,
  Spin,
  Flex,
  Tag,
  Popconfirm,
  Descriptions,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

import { useParams, useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import { messageApiRef } from "@/components/layout/MessageProvider";
import { Post, Topic } from "@/types/post";
import {
  deletePost,
  deletePostPermanent,
  getDeletedPostsDetail,
  restorePost,
  updatePost,
} from "@/api/post";
import isEqual from "lodash/isEqual";

const { Option } = Select;

export default function DetailPostPage() {
  const apiKey = process.env.NEXT_PUBLIC_TINY_MCE_API_KEY;

  const router = useRouter();
  const [form] = Form.useForm();
  const param = useParams() as { id?: string };
  const id: string = param?.id ?? "";

  const [post, setPost] = useState<Post>();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeletedTopic, setIsDeletedTopic] = useState<boolean>(false);
  const [originalData, setOriginalData] = useState<any>(null);

  const fetchPostDetail = async () => {
    try {
      setLoadingOptions(true);
      const res = await getDeletedPostsDetail(id);
      const postData = res.data.data.post;
      setPost(postData);
      setIsDeletedTopic(res.data.data.post.topic.is_deleted);

      const initialObj = {
        title: postData.title || "",
        topic_id: postData.topic.id,
        content: postData.content || "",
        is_published: postData.is_published,
      };

      setOriginalData(initialObj);

      form.setFieldsValue({
        title: postData.title,
        topic_id: postData.topic?.name,
        content: postData.content,
        is_published: postData.is_published,
        slug: postData.slug,
        published_at: new Date(postData.published_at).toLocaleString("vi-VN"),
      });

      setContent(postData.content || "");
      setIsPublished(postData.is_published);
    } catch (error: any) {
      messageApiRef.error(error);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPostDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleTopicChange = (value: string) => {
    const selectedTopic = topics.find((t) => t.id === value);
    if (!selectedTopic) {
      setIsDeletedTopic(false);
      return;
    }
    setIsDeletedTopic(selectedTopic.is_deleted || false);
  };

  const normalizeHTML = (html: string) => {
    if (!html) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const normalizedHTML = tempDiv.innerHTML;

    return normalizedHTML
      .replace(/\r\n/g, "\n")
      .replace(/\n+/g, "\n")
      .replace(/\s+/g, " ")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  const normalizeValue = (value: any, isHTML = false) => {
    if (typeof value === "string") {
      if (isHTML) {
        return normalizeHTML(value);
      }
      return value.replace(/\r\n/g, "\n").trim();
    }
    return value;
  };

  const onFinish = async (values: any) => {
    setIsLoading(true);

    const currentData = {
      title: normalizeValue(values.title),
      topic_id: values.topic_id,
      content: normalizeValue(content, true),
      is_published: isPublished,
    };

    const normalizedOriginalData = {
      title: normalizeValue(originalData.title),
      topic_id: originalData.topic_id,
      content: normalizeValue(originalData.content, true),
      is_published: originalData.is_published,
    };

    const changedFields: any = {};
    let hasChanges = false;

    (Object.keys(currentData) as Array<keyof typeof currentData>).forEach(
      (key) => {
        if (!isEqual(currentData[key], normalizedOriginalData[key])) {
          changedFields[key] = key === "content" ? content : currentData[key];
          hasChanges = true;
        }
      }
    );

    if (!hasChanges) {
      messageApiRef.info("Không có thay đổi nào để lưu!");
      setIsLoading(false);
      return;
    }

    try {
      const res = await updatePost(id, changedFields);
      messageApiRef.success(res.data.message);
      router.push("/posts");
    } catch (error: any) {
      messageApiRef.error(error || "Có lỗi xảy ra!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deletePostPermanent(id);
      messageApiRef.success(res.data.message);
      router.push("/posts/deleted");
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleRestore = async () => {
    try {
      const res = await restorePost(id);
      messageApiRef.success(res.data.message);
      router.push("/posts/deleted");
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleBack = () => {
    router.push("/posts");
  };

  if (loadingOptions) {
    return (
      <div className="flex justify-center p-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <Flex align="center" justify="space-between" className="mb-6">
        <h1 className="text-2xl font-bold text-black">Chi tiết bài viết</h1>

        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
        >
          Quay lại
        </Button>
      </Flex>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ is_sale: false, is_active: true, category_ids: [] }}
        className=""
      >
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item label="Slug" name="slug">
          <Input disabled />
        </Form.Item>

        <div className="flex items-center gap-2">
          <Form.Item
            label="Chủ đề"
            name="topic_id"
            rules={[{ required: true, message: "Vui lòng chọn chủ đề" }]}
            className="flex-1"
          >
            <Select
              placeholder="Chọn chủ đề"
              onChange={handleTopicChange}
              disabled
            >
              {topics.map((t: Topic) => (
                <Option key={t.id} value={t.id}>
                  {t.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {isDeletedTopic && (
            <Tag className="h-8 px-2 text-sm flex items-center" color="red">
              Đã xóa
            </Tag>
          )}
        </div>

        <Form.Item
          label="Nội dung bài viết"
          name="content"
          rules={[
            { required: true, message: "Vui lòng nhập nội dung bài viết" },
          ]}
          validateStatus={!form.getFieldValue("content") ? "error" : ""}
          help={
            !form.getFieldValue("content")
              ? "Vui lòng nhập nội dung bài viết"
              : ""
          }
        >
          <Editor
            disabled
            apiKey={apiKey}
            value={content}
            onEditorChange={(newContent) => {
              setContent(newContent);
            }}
            init={{
              height: 500,
              menubar: true,
              plugins: "image link media table code",
              toolbar:
                "undo redo | bold italic underline | alignleft aligncenter alignright | image | code",
              automatic_uploads: true,
              file_picker_types: "image",
              images_upload_handler: async (blobInfo: {
                base64: () => any;
                blob: () => { (): any; new (): any; type: any };
              }) => {
                return new Promise((resolve) => {
                  const base64 = blobInfo.base64();
                  const mime = blobInfo.blob().type;
                  resolve(`data:${mime};base64,${base64}`);
                });
              },
            }}
          />
        </Form.Item>

        <Flex gap={20}>
          <Form.Item
            label="Đăng tải"
            name="is_published"
            valuePropName="checked"
          >
            <Switch disabled onChange={(val) => setIsPublished(val)} />
          </Form.Item>

          <Form.Item label="Ngày đăng tải" name="published_at">
            <Input disabled />
          </Form.Item>
        </Flex>

        <div className="flex flex-col gap-5">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Ngày tạo">
              {new Date(post?.created_at ?? "").toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {post?.created_by?.profile
                ? `${post?.created_by.profile.first_name} ${post?.created_by.profile.last_name}`
                : post?.created_by?.username || "(Không rõ)"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày xóa">
              {new Date(post?.updated_at ?? "").toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Người xóa">
              {post?.updated_by?.profile
                ? `${post?.updated_by.profile.first_name} ${post?.updated_by.profile.last_name}`
                : post?.updated_by?.username || "(Không rõ)"}
            </Descriptions.Item>
          </Descriptions>

          <Form.Item>
            <div className="flex gap-4 items-center">
              <Popconfirm
                title="Bạn có chắc muốn khôi phục bài viết này?"
                okText="Khôi phục"
                cancelText="Hủy"
                onConfirm={handleRestore}
                disabled={isLoading}
                okButtonProps={{
                  danger: true,
                  loading: isLoading,
                }}
              >
                <Button
                  type="primary"
                  icon={<RollbackOutlined />}
                  className="bg-blue-500 flex items-center justify-center mr-4"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang khôi phục" : "Khôi phục"}
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Bạn có chắc muốn xóa VĨNH VIỄN bài viết này?"
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={handleDelete}
                disabled={isLoading}
                icon={<DeleteOutlined className="text-red-500" />}
                okButtonProps={{
                  danger: true,
                  loading: isLoading,
                }}
              >
                <Button
                  type="primary"
                  icon={<DeleteOutlined />}
                  className="bg-red-500 flex items-center justify-center"
                  loading={isLoading}
                  disabled={isLoading}
                  danger
                >
                  {isLoading ? "Đang xóa" : "Xóa"}
                </Button>
              </Popconfirm>
            </div>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
