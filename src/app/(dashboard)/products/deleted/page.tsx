/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  deleteProductPermanent,
  deleteProductsPermanent,
  getCategories,
  getDeletedProduct,
  getTags,
  restoreProduct,
  restoreProducts,
} from "@/api/product";
import { Button, Input, Popconfirm, Select, Space, Tag, Tooltip } from "antd";
import { Category, Product, Tags } from "@/types/product";
import Link from "antd/es/typography/Link";
import { Image } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import {
  BackwardOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { messageApiRef } from "@/components/layout/MessageProvider";

export default function DeletedProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  const fetchDeletedProduct = async () => {
    try {
      setLoading(true);
      const res = await getDeletedProduct({
        page,
        limit,
        sort,
        order,
        is_active: isActive,
        search,
        category_id: categoryId,
        tag_id: tagId,
      });
      const productList = res?.data?.data?.products;
      setProducts(Array.isArray(productList) ? productList : []);
      messageApiRef.success(res.data.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      messageApiRef.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedProduct();
  }, [page, limit, sort, order, isActive, search, categoryId, tagId]);

  const router = useRouter();

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await restoreProduct(id);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedProduct();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleBulkRestore = async (ids: string[]) => {
    try {
      const res = await restoreProducts(ids);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedProduct();
    } catch (error: any) {
      messageApiRef.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteProductPermanent(id);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedProduct();
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deleteProductsPermanent(ids);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedProduct();
    } catch (error: any) {
      messageApiRef.error(error);
    }
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
            href={`/products/${record.id}/deleted`}
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
            icon={<RollbackOutlined style={{ color: "blue" }} />}
            style={{ border: "none", boxShadow: "none" }}
            onClick={() => handleRestore(record.id)}
          />

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
              <DeleteOutlined style={{ fontSize: 18 }} />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex justify-between mb-5">
        <Space>
          <Button
            type="dashed"
            icon={<BackwardOutlined />}
            onClick={() => router.push("/products")}
          >
            Quay lại
          </Button>

          <Popconfirm
            title={`Bạn có chắc muốn xóa ${selectedRowKeys.length} sản phẩm`}
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

          <Popconfirm
            title={`Bạn có chắc muốn khôi phục ${selectedRowKeys.length} sản phẩm này?`}
            onConfirm={() =>
              handleBulkRestore(selectedRowKeys.map((id) => id.toString()))
            }
            okText="Khôi phục"
            cancelText="Hủy"
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              type="primary"
              icon={<RollbackOutlined />}
              disabled={selectedRowKeys.length === 0}
            >
              {selectedRowKeys.length > 0
                ? `Khôi phục ${selectedRowKeys.length} sản phẩm`
                : "Khôi phục"}
            </Button>
          </Popconfirm>
        </Space>
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
}
