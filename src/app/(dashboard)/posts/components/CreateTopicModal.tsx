"use client";

import { Modal, Form, Input } from "antd";
import { Topic } from "@/types/post";

interface ICreateTopicModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (data: Topic) => void;
}

const CreateTopicModal = ({
  open,
  onCancel,
  onCreate,
}: ICreateTopicModalProps) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (!values.slug) {
        values.slug = "";
      }
      onCreate(values);
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Thêm Topic"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Tạo"
      cancelText="Hủy"
      getContainer={false}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên topic"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập chủ đề" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Slug" name="slug">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTopicModal;
