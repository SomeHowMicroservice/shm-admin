/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  deleteSizePermanent,
  deleteSizesPermanent,
  getDeletedSizes,
  restoreSize,
  restoreSizes,
} from "@/api/product";
import { Button, Popconfirm, Space, Table } from "antd";
import { Size } from "@/types/product";
import {
  BackwardOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { messageApiRef } from "@/components/layout/MessageProvider";

export default function DeletedSizes() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchDeletedSizes = async () => {
    try {
      setLoading(true);
      const res = await getDeletedSizes();
      const sizeList = res?.data?.data?.sizes;
      setSizes(Array.isArray(sizeList) ? sizeList : []);
      messageApiRef.success(res.data.message);
    } catch (error: any) {
      messageApiRef.error(error || "Lỗi khi tải danh sách size");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedSizes();
  }, []);

  const router = useRouter();

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await restoreSize(id);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedSizes();
    } catch (error: any) {
      messageApiRef.error(error || "Lỗi khi khôi phục");
    }
  };

  const handleBulkRestore = async (ids: string[]) => {
    try {
      const res = await restoreSizes(ids);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedSizes();
    } catch (error: any) {
      messageApiRef.error(error || "Lỗi khi khôi phục hàng loạt");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteSizePermanent(id);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedSizes();
    } catch (error: any) {
      messageApiRef.error(error || "Lỗi khi xóa vĩnh viễn");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deleteSizesPermanent(ids);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedSizes();
    } catch (error: any) {
      messageApiRef.error(error || "Lỗi khi xóa vĩnh viễn hàng loạt");
    }
  };

  const columns = [
    {
      title: "Tên size",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      key: "created_by",
      render: (created_by: Size["created_by"]) =>
        created_by?.profile
          ? `${created_by.profile.first_name} ${created_by.profile.last_name}`
          : created_by?.username || "–",
    },
    {
      title: "Người xóa",
      dataIndex: "updated_by",
      key: "updated_by",
      render: (updated_by: Size["updated_by"]) =>
        updated_by?.profile
          ? `${updated_by.profile.first_name} ${updated_by.profile.last_name}`
          : updated_by?.username || "–",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (created_at: string) =>
        created_at
          ? new Date(created_at).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "–",
    },
    {
      title: "Ngày xóa",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (updated_at: string) =>
        updated_at
          ? new Date(updated_at).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "–",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, record: Size) => (
        <div className="flex gap-2">
          <Button
            type="link"
            onClick={() => handleDelete(record.id)}
            icon={<DeleteOutlined />}
            danger
          />
          <Button
            type="link"
            onClick={() => handleRestore(record.id)}
            icon={<RollbackOutlined />}
          />
        </div>
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
            loading={btnLoading}
            onClick={() => {
              setBtnLoading(true);
              router.push("/products/sizes");
            }}
          >
            Quay lại
          </Button>

          <Popconfirm
            title={`Bạn có chắc muốn xóa ${selectedRowKeys.length} sản phẩm?`}
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
                ? `Xóa ${selectedRowKeys.length} sizes`
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
                ? `Khôi phục ${selectedRowKeys.length} sizes`
                : "Khôi phục"}
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={sizes}
        loading={loading}
        rowSelection={rowSelection}
      />
    </div>
  );
}
