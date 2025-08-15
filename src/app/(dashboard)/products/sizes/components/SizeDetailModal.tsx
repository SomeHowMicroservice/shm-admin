import { Modal, Descriptions, Input } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Size } from "@/types/product";

interface ISizeDetailModalProps {
  size?: Size;
  onCancel: () => void;
  onUpdate: (updated: Size) => void;
}

const SizeDetailModal = ({
  size,
  onCancel,
  onUpdate,
}: ISizeDetailModalProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (size) {
      setName(size.name);
    }
  }, [size]);

  const handleUpdate = () => {
    if (size) {
      onUpdate({ ...size, name });
    }
  };

  return (
    <Modal
      title="Chi tiết Size"
      open={!!size}
      onCancel={onCancel}
      onOk={handleUpdate}
      okText="Cập nhật"
      cancelText="Đóng"
      getContainer={false}
    >
      {size && (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Tên size">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dayjs(size.created_at).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {`${size.created_by?.profile?.first_name || ""} ${
              size.created_by?.profile?.last_name || ""
            }`}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {dayjs(size.updated_at).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Người cập nhật">
            {`${size.updated_by?.profile?.first_name || ""} ${
              size.updated_by?.profile?.last_name || ""
            }`}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

export default SizeDetailModal;
