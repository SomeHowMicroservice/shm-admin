/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Popconfirm,
  Table,
  Tag,
  Image,
  Tooltip,
  Space,
  Input,
  Select,
} from "antd";
import { useRouter } from "next/navigation";
import { getAllProducts, deleteProduct, deleteProducts } from "@/api/product";
import { ColumnsType } from "antd/es/table";
import EditOutlined from "@ant-design/icons/lib/icons/EditOutlined";
import { DeleteOutlined, PlusOutlined, RestOutlined } from "@ant-design/icons";
import Link from "antd/es/typography/Link";
import { getCategories, getTags } from "@/api/product";
import { messageApiRef } from "@/components/layout/MessageProvider";
import { Tags } from "@/types/product";

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

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tags[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState<string | undefined>();
  const [order, setOrder] = useState<"asc" | "desc" | undefined>();
  const [isActive, setIsActive] = useState<boolean | undefined>();
  const [search, setSearch] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [tagId, setTagId] = useState<string | undefined>();

  const fetchFilterData = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([getCategories(), getTags()]);

      const categoryOptions =
        catRes?.data?.data?.categories?.map((cat: any) => ({
          label: `${cat.name} (${cat.slug})`,
          value: cat.id,
        })) || [];

      const tagOptions =
        tagRes?.data?.data?.tags?.map((tag: any) => ({
          label: tag.name,
          value: tag.id,
        })) || [];

      setCategories(categoryOptions);
      setTags(tagOptions);
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getAllProducts({
        page,
        limit,
        sort,
        order,
        is_active: isActive,
        search,
        category_id: categoryId,
        tag_id: tagId,
      });
      setProducts(res.data.data.products || []);
    } catch (error: any) {
      messageApiRef.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit, sort, order, isActive, search, categoryId, tagId]);

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteProduct(id);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchProducts();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deleteProducts(ids);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchProducts();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

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
          {categories?.map((cat) => (
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
            okButtonProps={{
              danger: true,
            }}
          >
            <Button type="link" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded shadow">
      {/* Nút thao tác */}
      <div className="flex justify-between mb-5">
        <Space>
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
                ? `Xóa ${selectedRowKeys.length} sản phẩm`
                : "Xóa"}
            </Button>
          </Popconfirm>
        </Space>

        <Button
          type="default"
          icon={<RestOutlined style={{ color: "red" }} />}
          onClick={() => router.push("/products/deleted")}
        >
          Sản phẩm đã xóa
        </Button>
      </div>

      <div className="flex-wrap gap-4 mb-5 flex justify-between">
        <Input.Search
          placeholder="Tìm kiếm sản phẩm..."
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
              setIsActive(value === undefined ? undefined : value === "true");
              setPage(1);
            }}
          >
            <Select.Option value="true">Đang bán</Select.Option>
            <Select.Option value="false">Ngừng bán</Select.Option>
          </Select>

          <Select
            placeholder="Danh mục"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => {
              setCategoryId(value || undefined);
              setPage(1);
            }}
            options={categories}
          />

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
              { label: "Giá thấp → cao", value: "price|asc" },
              { label: "Giá cao → thấp", value: "price|desc" },
            ]}
          />
        </div>
      </div>

      {/* Bảng */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          onChange: (p, l) => {
            setPage(p);
            setLimit(l);
          },
        }}
        rowSelection={rowSelection}
      />
    </div>
  );
};

export default ProductListPage;
