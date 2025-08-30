/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Form, Input, Button, Select, Switch, Spin, Flex, Tag } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { useParams, useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import { messageApiRef } from "@/components/layout/MessageProvider";
import { ICreatePostData, Post, Topic } from "@/types/post";
import { getAllTopics, getPostById, updatePost } from "@/api/post";

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

  const fetchPostDetail = async () => {
    try {
      setLoadingOptions(true);
      const res = await getPostById(id);
      const postData = res.data.data.post;
      setPost(postData);
      setIsDeletedTopic(res.data.data.post.topic.is_deleted);

      form.setFieldsValue({
        title: postData.title,
        topic_id: postData.topic?.name,
        content: postData.content,
        is_published: postData.is_published,
      });

      setContent(postData.content || "");
      setIsPublished(postData.is_published);
    } catch (error: any) {
      messageApiRef.error(error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchAllTopics = async () => {
    try {
      setLoadingOptions(true);
      const res = await getAllTopics();
      setTopics(res.data.data.topics);
    } catch (error: any) {
      messageApiRef.error(error);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPostDetail();
      fetchAllTopics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleTopicChange = (value: string) => {
    const selectedTopic = topics.find((t) => t.id === value);

    // Nếu không có topic trong danh sách hoặc topic không bị xóa thì bỏ tag
    if (!selectedTopic) {
      setIsDeletedTopic(false);
      return;
    }

    // Nếu có topic trong danh sách, chỉ initial topic mới có is_deleted
    setIsDeletedTopic(selectedTopic.is_deleted || false);
  };

  const onFinish = async (values: any) => {
    setIsLoading(true);
    try {
      const payload: ICreatePostData = {
        title: values.title,
        topic_id: values.topic_id,
        content: content,
        is_published: isPublished,
      };

      const res = await updatePost(id, payload);
      messageApiRef.success(res.data.message);
      fetchPostDetail();
    } catch (error: any) {
      messageApiRef.error(error || "Có lỗi xảy ra!");
    } finally {
      setIsLoading(false);
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
          <Input />
        </Form.Item>

        <div className="flex items-center gap-2">
          <Form.Item
            label="Chủ đề"
            name="topic_id"
            rules={[{ required: true, message: "Vui lòng chọn chủ đề" }]}
            className="flex-1"
          >
            <Select placeholder="Chọn chủ đề" onChange={handleTopicChange}>
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

        <Form.Item label="Đăng tải" name="is_published" valuePropName="checked">
          <Switch onChange={(val) => setIsPublished(val)} />
        </Form.Item>

        <Form.Item className="pt-4">
          <Button
            type="primary"
            htmlType="submit"
            className="bg-blue-500"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý " : "Cập nhật"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
