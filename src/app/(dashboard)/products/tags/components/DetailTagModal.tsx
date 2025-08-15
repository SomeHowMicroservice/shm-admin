import { Modal, Descriptions, Input } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Tags } from "@/types/product";

interface ITagDetailModalProps {
  tag?: Tags;
  onCancel: () => void;
  onUpdate: (updated: Tags) => void;
}

const TagDetailModal = ({ tag, onCancel, onUpdate }: ITagDetailModalProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (tag) {
      setName(tag.name);
    }
  }, [tag]);

  const handleUpdate = () => {
    if (tag) {
      onUpdate({ ...tag, name });
    }
  };

  return (
    <Modal
      title="Chi tiết Tag"
      open={!!tag}
      onCancel={onCancel}
      onOk={handleUpdate}
      okText="Cập nhật"
      cancelText="Đóng"
      getContainer={false}
    >
      {tag && (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Tên tag">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dayjs(tag.created_at).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {`${tag.created_by?.profile?.first_name || ""} ${
              tag.created_by?.profile?.last_name || ""
            }`}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {dayjs(tag.updated_at).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Người cập nhật">
            {`${tag.updated_by?.profile?.first_name || ""} ${
              tag.updated_by?.profile?.last_name || ""
            }`}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

export default TagDetailModal;
