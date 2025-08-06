"use client";

import { Modal, Form, Input } from "antd";
import { useEffect } from "react";
import { Size } from "@/types/product";

interface ISizeDetailModalProps {
  size: Size;
  onCancel: () => void;
  onUpdate: (updated: Size) => void;
}

const SizeDetailModal = ({
  size,
  onCancel,
  onUpdate,
}: ISizeDetailModalProps) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onUpdate({ ...size, ...values });
    });
  };

  useEffect(() => {
    form.setFieldsValue(size);
  }, [form, size]);

  if (!open) return null;

  return (
    <Modal
      title="Chi tiết Size"
      open={!!size}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Cập nhật"
      cancelText="Đóng"
      getContainer={false}
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

export default SizeDetailModal;
