"use client";

import { Modal, Form, Input } from "antd";
import { useEffect } from "react";
import { Color } from "@/types/product";

interface ISizeCreateModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (data: Color) => void;
}

const CreateColorModal = ({
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

  return (
    <Modal
      title="Thêm Màu"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Tạo"
      cancelText="Hủy"
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

export default CreateColorModal;
