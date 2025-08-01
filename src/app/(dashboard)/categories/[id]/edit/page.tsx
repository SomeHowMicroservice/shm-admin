"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Form, Input, message, Spin } from "antd";
import axiosRequest from "@/config/axios";
import { ICreateCategoryData } from "@/types/product";
import { getCategories } from "@/api/product";

const EditCategoryPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await getCategories();
        form.setFieldsValue(res.data);
      } catch {
        message.error("Không thể tải dữ liệu danh mục");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, form]);

  const onFinish = async (values: ICreateCategoryData) => {
    try {
      await axiosRequest.put(`/admin/categories/${id}`, values);
      message.success("Cập nhật danh mục thành công");
      router.push("/category");
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-6">Chỉnh sửa danh mục</h2>
      {loading ? (
        <Spin />
      ) : (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default EditCategoryPage;
