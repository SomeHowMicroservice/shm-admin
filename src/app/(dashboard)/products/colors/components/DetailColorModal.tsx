import { Modal, Descriptions, Input } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Color } from "@/types/product";

interface IColorDetailModalProps {
  color?: Color;
  onCancel: () => void;
  onUpdate: (updated: Color) => void;
}

const ColorDetailModal = ({
  color,
  onCancel,
  onUpdate,
}: IColorDetailModalProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (color) {
      setName(color.name);
    }
  }, [color]);

  const handleUpdate = () => {
    if (color) {
      onUpdate({ ...color, name });
    }
  };

  return (
    <Modal
      title="Chi tiết Màu"
      open={!!color}
      onCancel={onCancel}
      onOk={handleUpdate}
      okText="Cập nhật"
      cancelText="Đóng"
      getContainer={false}
    >
      {color && (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Tên color">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dayjs(color.created_at).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {`${color.created_by?.profile?.first_name || ""} ${
              color.created_by?.profile?.last_name || ""
            }`}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {dayjs(color.updated_at).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Người cập nhật">
            {`${color.updated_by?.profile?.first_name || ""} ${
              color.updated_by?.profile?.last_name || ""
            }`}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

export default ColorDetailModal;
