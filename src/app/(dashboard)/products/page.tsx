// ProductListPage.tsx
"use client";

import { useEffect, useState } from "react";
import { Button, Popconfirm, Table, Tag, message, Image, Tooltip } from "antd";
import { useRouter } from "next/navigation";
import { getAllProducts } from "@/api/product";
import { ColumnsType } from "antd/es/table";
import EditOutlined from "@ant-design/icons/lib/icons/EditOutlined";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import Link from "antd/es/typography/Link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Thumbnail {
  id: string;
  url: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  categories: Category[];
  thumbnail: Thumbnail;
}

const ProductListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getAllProducts();
      setProducts(res.data.data.products || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // try {
    //   await axiosRequest.delete(`/admin/products/${id}`);
    //   message.success("Xóa sản phẩm thành công");
    //   fetchProducts();
    // } catch (error) {
    //   message.error("Xóa sản phẩm thất bại");
    // }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns: ColumnsType<Product> = [
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
      title: "Tên sản phẩm",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => (
        <Tooltip title={title} className="cursor-pointer">
          <Link
            href={`/products/${record.id}`}
            className="max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis hover:underline"
          >
            {title}
          </Link>
        </Tooltip>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `${price.toLocaleString()}₫`,
    },
    {
      title: "Danh mục",
      dataIndex: "categories",
      key: "categories",
      render: (categories: Category[]) => (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Tag key={cat.id} color="blue">
              {cat.name}
            </Tag>
          ))}
        </div>
      ),
      width: 250,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="link"
            onClick={() => router.push(`/products/${record.id}`)}
          >
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger>
              <DeleteOutlined size={26} />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded shadow">
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => router.push("/products/create")}
        className="mb-5"
      >
        Tạo mới
      </Button>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={{ pageSize: 10 }}
        rowSelection={rowSelection}
      />
    </div>
  );
};

export default ProductListPage;
