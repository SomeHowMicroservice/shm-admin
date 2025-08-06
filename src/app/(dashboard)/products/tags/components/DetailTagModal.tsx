"use client";

import { Modal, Form, Input } from "antd";
import { useEffect } from "react";
import { Tags } from "@/types/product";

interface ITagDetailModalProp {
  tag: Tags;
  onCancel: () => void;
  onUpdate: (updated: Tags) => void;
}

const TagDetailModal = ({ tag, onCancel, onUpdate }: ITagDetailModalProp) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onUpdate({ ...tag, ...values });
    });
  };

  useEffect(() => {
    form.setFieldsValue(tag);
  }, [form, tag]);

  return (
    <Modal
      title="Chi tiết Size"
      open={!!tag}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Cập nhật"
      cancelText="Đóng"
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

export default TagDetailModal;
