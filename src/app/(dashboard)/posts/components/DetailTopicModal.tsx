import { Modal, Descriptions, Input } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Topic } from "@/types/post";

interface ITopicDetailModalProps {
  topic?: Topic;
  onCancel: () => void;
  onUpdate: (updated: Topic) => void;
}

const TopicDetailModal = ({
  topic,
  onCancel,
  onUpdate,
}: ITopicDetailModalProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (topic) {
      setName(topic.name);
    }
  }, [topic]);

  const handleUpdate = () => {
    if (topic) {
      onUpdate({ ...topic, name });
    }
  };

  return (
    <Modal
      title="Chi tiết Màu"
      open={!!topic}
      onCancel={onCancel}
      onOk={handleUpdate}
      okText="Cập nhật"
      cancelText="Đóng"
      getContainer={false}
    >
      {topic && (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Tên topic">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dayjs(topic.created_at).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {`${topic.created_by?.profile?.first_name || ""} ${
              topic.created_by?.profile?.last_name || ""
            }`}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {dayjs(topic.updated_at).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Người cập nhật">
            {`${topic.updated_by?.profile?.first_name || ""} ${
              topic.updated_by?.profile?.last_name || ""
            }`}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

export default TopicDetailModal;
