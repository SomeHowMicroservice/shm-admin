"use client";

import { useEffect, useState } from "react";
import { Button, Form, Input, message, Select, Spin } from "antd";
import { useRouter } from "next/navigation";
import { createCategory, getCategories } from "@/api/product";
import { ICreateCategoryData } from "@/types/product";
import { toast } from "react-toastify";
import { Category } from "@/types/product";

const CreateCategoryPage = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [parentOptions, setParentOptions] = useState<Category[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);

  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        setLoadingParents(true);
        const res = await getCategories();
        setParentOptions(res.data.data.categories || []);
      } catch (error) {
        toast.error(
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "Lỗi khi tải danh mục cha"
        );
      } finally {
        setLoadingParents(false);
      }
    };

    fetchParentCategories();
  }, []);

  const onFinish = async (
    values: ICreateCategoryData & { parent_ids?: string[] }
  ) => {
    try {
      const { parent_ids, ...rest } = values;
      const payload = parent_ids?.length ? { ...rest, parent_ids } : rest;

      const res = await createCategory(payload);
      message.success(res.data.message);
      router.push("/products/categories");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-semibold text-black mb-6">
        Tạo danh mục mới
      </h2>

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

        <Form.Item label="Danh mục cha (có thể chọn nhiều)" name="parent_ids">
          {loadingParents ? (
            <Spin />
          ) : (
            <Select
              mode="multiple"
              allowClear
              placeholder="Chọn danh mục cha"
              options={parentOptions.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
              showSearch
              optionFilterProp="label"
            />
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateCategoryPage;
