"use client";

import { Modal, Form, Input } from "antd";
import { Tags } from "@/types/product";

interface ITagCreateModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (data: Tags) => void;
}

const TagCreateModal = ({ open, onCancel, onCreate }: ITagCreateModalProps) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onCreate(values);
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Thêm Tag"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Tạo"
      cancelText="Hủy"
      getContainer={false}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên tag"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên size" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TagCreateModal;
