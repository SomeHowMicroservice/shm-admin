/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  deleteTagPermanent,
  deleteTagsPermanent,
  getDeletedTags,
  restoreTag,
  restoreTags,
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

export default function DeletedTags() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchDeletedTags = async () => {
    try {
      setLoading(true);
      const res = await getDeletedTags();
      const tagList = res?.data?.data?.tags;
      setSizes(Array.isArray(tagList) ? tagList : []);
      messageApiRef.success(res.data.message);
    } catch (error: any) {
      messageApiRef.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedTags();
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
      const res = await restoreTag(id);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedTags();
    } catch (error: any) {
      messageApiRef.error(error || "Lỗi khi khôi phục");
    }
  };

  const handleBulkRestore = async (ids: string[]) => {
    try {
      const res = await restoreTags(ids);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedTags();
    } catch (error: any) {
      messageApiRef.error(error || "Lỗi khi khôi phục hàng loạt");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteTagPermanent(id);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedTags();
    } catch (error: any) {
      messageApiRef.error(error || "Lỗi khi xóa vĩnh viễn");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await deleteTagsPermanent(ids);
      messageApiRef.success(res.data.message);
      setSelectedRowKeys([]);
      fetchDeletedTags();
    } catch (error: any) {
      messageApiRef.error(error || "Lỗi khi xóa vĩnh viễn hàng loạt");
    }
  };

  const columns = [
    {
      title: "Tên tag",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      render: (_: unknown, record: Size) => {
        const profile = record.created_by?.profile;
        return profile
          ? `${profile.first_name} ${profile.last_name}`
          : record.created_by?.username || "-";
      },
    },
    {
      title: "Người xóa",
      dataIndex: "updated_by",
      render: (_: unknown, record: Size) => {
        const profile = record.updated_by?.profile;
        return profile
          ? `${profile.first_name} ${profile.last_name}`
          : record.updated_by?.username || "-";
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      render: (_: unknown, record: Size) =>
        record.created_at
          ? new Date(record.created_at).toLocaleString("vi-VN")
          : "-",
    },
    {
      title: "Ngày xóa",
      dataIndex: "updated_at",
      render: (_: unknown, record: Size) =>
        record.updated_at
          ? new Date(record.updated_at).toLocaleString("vi-VN")
          : "-",
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
              router.push("/products/tags");
            }}
          >
            Quay lại
          </Button>

          <Popconfirm
            title={`Bạn có chắc muốn xóa ${selectedRowKeys.length} tags?`}
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
                ? `Xóa ${selectedRowKeys.length} tags`
                : "Xóa"}
            </Button>
          </Popconfirm>

          <Popconfirm
            title={`Bạn có chắc muốn khôi phục ${selectedRowKeys.length} tags?`}
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
                ? `Khôi phục ${selectedRowKeys.length} tags`
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
