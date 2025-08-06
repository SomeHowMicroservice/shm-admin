"use client";

import { Modal, Form, Input } from "antd";
import { useEffect } from "react";
import { Size } from "@/types/product";

interface ISizeCreateModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (data: Size) => void;
}

const SizeCreateModal = ({
  open,
  onCancel,
  onCreate,
}: ISizeCreateModalProps) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onCreate(values);
      form.resetFields();
    });
  };

  if (!open) return null;

  return (
    <Modal
      title="Thêm Size"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Tạo"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên size"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên size" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SizeCreateModal;
