"use client";

import { Modal, Form, Input } from "antd";
import { useEffect } from "react";
import { Color } from "@/types/product";

interface ISizeDetailModalProps {
  size: Color;
  onCancel: () => void;
  onUpdate: (updated: Color) => void;
}

const DetailColorModal = ({
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

  return (
    <Modal
      title="Chi tiết Màu"
      open={!!size}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Cập nhật"
      cancelText="Đóng"
      getContainer={false}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên màu"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập màu" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DetailColorModal;
