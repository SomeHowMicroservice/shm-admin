/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Form, Input, Button, Select, Switch, Spin } from "antd";

import { useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import { messageApiRef } from "@/components/layout/MessageProvider";
import { ICreatePostData, Topic } from "@/types/post";
import { createPost, getAllTopics } from "@/api/post";

const { Option } = Select;

export default function CreatePostPage() {
  const apiKey = process.env.NEXT_PUBLIC_TINY_MCE_API_KEY;

  const router = useRouter();
  const [form] = Form.useForm();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
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

    fetchAllTopics();
  }, []);

  const onFinish = async (values: any) => {
    setIsLoading(true);
    try {
      const payload: ICreatePostData = {
        title: values.title,
        topic_id: values.topic_id,
        content: content,
        is_published: isPublished,
      };

      const res = await createPost(payload);
      messageApiRef.success(res.data.message);
      router.push("/posts/");
    } catch (error: any) {
      messageApiRef.error(error || "Có lỗi xảy ra!");
    } finally {
      setIsLoading(false);
    }
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
      <h1 className="text-2xl font-bold mb-6 text-black">Tạo bài viết</h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ is_sale: false, is_active: true, category_ids: [] }}
        className="space-y-4"
      >
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Chủ đề"
          name="topic_id"
          rules={[{ required: true, message: "Vui lòng chọn chủ đề" }]}
        >
          <Select placeholder="Chọn chủ đề">
            {topics.map((t: Topic) => (
              <Option key={t.id} value={t.id}>
                {t.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

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
            onEditorChange={(newContent) => setContent(newContent)}
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
            {isLoading ? "Đang xử lý " : "Tạo post"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
