"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Descriptions, Spin, Button, message } from "antd";
import axiosRequest from "@/config/axios";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const CategoryDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axiosRequest.get(`/admin/categories/${id}`);
        setCategory(res.data);
      } catch {
        message.error("Không thể tải dữ liệu chi tiết danh mục");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Button
        onClick={() => router.push("/category")}
        style={{ marginBottom: 16 }}
      >
        ← Quay lại danh sách
      </Button>

      {loading ? (
        <Spin />
      ) : category ? (
        <Card title="Chi tiết danh mục">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{category.id}</Descriptions.Item>
            <Descriptions.Item label="Tên danh mục">
              {category.name}
            </Descriptions.Item>
            <Descriptions.Item label="Slug">
              {category.slug || "(Không có)"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ) : (
        <p>Không tìm thấy danh mục</p>
      )}
    </div>
  );
};

export default CategoryDetailPage;
