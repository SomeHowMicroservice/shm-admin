"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Descriptions,
  Spin,
  Button,
  message,
  Form,
  Input,
  Select,
} from "antd";
import axiosRequest from "@/config/axios";
import { ProductModal } from "../components/ProductModal";
import { Product } from "../components/ProductModal";
import { updateCategory } from "@/api/product";

const { Option } = Select;

interface UserProfile {
  first_name: string;
  last_name: string;
}

interface User {
  username?: string;
  profile?: UserProfile;
}

interface Category {
  products: Product[];
  id: string;
  name: string;
  slug: string;
  parents: { id: string; name: string }[];
  updated_at: string | number | Date;
  updated_by: User | null;
  created_at: string | number | Date;
  created_by: User | null;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface IUpdateCategoryData {
  name: string;
  slug?: string;
  parent_ids?: string[];
}

const CategoryDetailPage = () => {
  const { id } = useParams();
  const category_id = id && id.toString();
  const router = useRouter();
  const [form] = Form.useForm();

  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axiosRequest.get(`/admin/categories/${id}`);
        const cat = res.data.data.category;
        setCategory(cat);
        form.setFieldsValue({
          name: cat.name,
          slug: cat.slug,
          parent_ids: cat?.parents?.map(
            (p: { name: string; id: string }) => p.id
          ),
        });
      } catch {
        message.error("Không thể tải dữ liệu chi tiết danh mục");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [form, id]);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const res = await axiosRequest.get("/admin/categories");
        setAllCategories(res.data.data.categories || []);
      } catch {
        message.error("Không thể tải danh sách danh mục cha");
      }
    };

    fetchAllCategories();
  }, []);

  const handleUpdate = async (values: IUpdateCategoryData) => {
    setUpdating(true);
    try {
      if (!category_id) {
        return;
      }

      const res = await updateCategory(category_id, {
        name: values.name,
        slug: values.slug,
        parent_ids: values.parent_ids,
      });

      message.success(res.data.message);
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Button
        onClick={() => router.push("/products/categories")}
        style={{ marginBottom: 16 }}
      >
        ← Quay lại
      </Button>

      {loading ? (
        <Spin />
      ) : category ? (
        <Card title="Chi tiết và Cập nhật danh mục">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdate}
            initialValues={{
              name: category.name,
              slug: category.slug,
              parent_ids: category?.parents?.map((p) => p.id),
            }}
          >
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tên danh mục">
                <Form.Item
                  name="name"
                  noStyle
                  rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                >
                  <Input />
                </Form.Item>
              </Descriptions.Item>

              <Descriptions.Item label="Slug">
                <Form.Item
                  name="slug"
                  noStyle
                  rules={[{ required: true, message: "Vui lòng nhập slug" }]}
                >
                  <Input />
                </Form.Item>
              </Descriptions.Item>

              <Descriptions.Item label="Danh mục cha">
                <Form.Item name="parent_ids" noStyle>
                  <Select mode="multiple" allowClear style={{ minWidth: 200 }}>
                    {allCategories
                      .filter((c) => c.id !== id)
                      .map((cat) => (
                        <Option key={cat.id} value={cat.id}>
                          {cat.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo">
                {new Date(category.created_at).toLocaleString("vi-VN")}
              </Descriptions.Item>

              <Descriptions.Item label="Người tạo">
                {category.created_by?.profile
                  ? `${category.created_by.profile.first_name} ${category.created_by.profile.last_name}`
                  : category.created_by?.username || "(Không rõ)"}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày cập nhật">
                {new Date(category.updated_at).toLocaleString("vi-VN")}
              </Descriptions.Item>

              <Descriptions.Item label="Người cập nhật">
                {category.updated_by?.profile
                  ? `${category.updated_by.profile.first_name} ${category.updated_by.profile.last_name}`
                  : category.updated_by?.username || "(Không rõ)"}
              </Descriptions.Item>

              <Descriptions.Item label=" " span={1}>
                <Form.Item noStyle>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updating}
                    className="mt-2"
                  >
                    Cập nhật
                  </Button>

                  <Button
                    onClick={() => setProductModalOpen(true)}
                    className="mt-2 pl-4"
                  >
                    Xem sản phẩm
                  </Button>
                </Form.Item>
              </Descriptions.Item>
            </Descriptions>
          </Form>

          <ProductModal
            visible={productModalOpen}
            onClose={() => setProductModalOpen(false)}
            products={category.products ?? []}
          />
        </Card>
      ) : (
        <p>Không tìm thấy danh mục</p>
      )}
    </div>
  );
};

export default CategoryDetailPage;
