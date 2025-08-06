"use client";

import { Modal, Image, List } from "antd";

export interface Product {
  id: string;
  title: string;
  slug: string;
  image?: {
    id: string;
    url: string;
    is_thumbnail: boolean;
  };
}

interface ProductModalProps {
  products: Product[];
  visible: boolean;
  onClose: () => void;
}

export const ProductModal = ({
  products,
  visible,
  onClose,
}: ProductModalProps) => {
  return (
    <Modal
      title={`Danh sách sản phẩm (${products.length})`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {products.length === 0 ? (
        <p>Danh mục chưa có sản phẩm nào.</p>
      ) : (
        <List
          dataSource={products}
          renderItem={(product) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Image
                    src={product.image?.url}
                    alt={product.title}
                    width={60}
                    height={60}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                  />
                }
                title={product.title}
                description={
                  <span className="text-gray-500">{product.slug}</span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};
