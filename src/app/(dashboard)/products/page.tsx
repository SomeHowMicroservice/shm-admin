"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Popconfirm,
  Table,
  Tag,
  message,
  Image,
  Tooltip,
  Space,
} from "antd";
import { useRouter } from "next/navigation";
import { getAllProducts } from "@/api/product";
import { ColumnsType } from "antd/es/table";
import EditOutlined from "@ant-design/icons/lib/icons/EditOutlined";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import Link from "antd/es/typography/Link";
import { deleteProduct, deleteProducts } from "@/api/product";

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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const router = useRouter();

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
    try {
      const res = await deleteProduct(id);
      message.success(res.data.message);
      setSelectedRowKeys([]);
      fetchProducts();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deleteProducts(ids);
      message.success(res.data.message);
      setSelectedRowKeys([]);
      fetchProducts();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error.message);
    }
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
        <Space>
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
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded shadow">
      <Space className="mb-5">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push("/products/create")}
        >
          Tạo mới
        </Button>

        <Popconfirm
          title={`Bạn có chắc muốn xóa ${selectedRowKeys.length} sản phẩm này?`}
          onConfirm={() =>
            handleBulkDelete(selectedRowKeys.map((id) => id.toString()))
          }
          okText="Xóa"
          cancelText="Hủy"
          disabled={selectedRowKeys.length === 0}
        >
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length === 0}
          >
            {selectedRowKeys.length > 0
              ? `Xóa ${selectedRowKeys.length} sản phẩm`
              : "Xóa"}
          </Button>
        </Popconfirm>
      </Space>

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
