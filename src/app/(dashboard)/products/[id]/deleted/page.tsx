/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Switch,
  message,
  DatePicker,
  Spin,
  UploadFile,
  Descriptions,
  Popconfirm,
} from "antd";
import {
  Category,
  Color,
  Product,
  Size,
  Tags,
  Variants,
} from "@/types/product";
import { Editor } from "@tinymce/tinymce-react";
import ColorImageUpload from "../../create/components/ColorImageUpload";
import { useParams } from "next/navigation";
import { getDeletedProductDetail, restoreProduct } from "@/api/product";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { RollbackOutlined } from "@ant-design/icons";

export interface ProductFormValues {
  update_images: any;
  title: string;
  category_ids: string[];
  image: string;
  description?: string;
  price: number;
  is_sale: boolean;
  sale_price?: number;
  start_sale?: string;
  end_sale?: string;
  size?: string;
  color?: string;
  tag_ids?: string[];
  variants?: Array<{
    size_id: any;
    color_id: any;
    id: undefined;
    sku: string;
    quantity: number;
    sold_quantity: number;
    stock: number;
    isStock: boolean;
    size: string;
    color: string;
    images?: UploadFile[];
  }>;
}

const { Option } = Select;
interface MyUploadFile extends UploadFile<any> {
  sortOrder: number;
  isThumbnail: any;
  isOld?: boolean;
}

export default function EditProductPage() {
  const router = useRouter();

  const apiKey = process.env.NEXT_PUBLIC_TINY_MCE_API_KEY;

  const [form] = Form.useForm();

  const [product, setProduct] = useState<Product>();
  const [sizes, setSizes] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [tags, setTags] = useState<Tags[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSale, setIsSale] = useState(false);
  const [colorImages, setColorImages] = useState<
    Record<string, MyUploadFile[]>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const param = useParams();
  const productId = String(param.id);
  const isDeletedProduct = true;

  const getAndSetData = useCallback(async () => {
    try {
      const productRes = await getDeletedProductDetail(productId);
      const product = productRes.data.data.product;

      setTags(product.tags);
      setCategories(product.categories);

      // Lấy danh sách color và size trực tiếp từ variants
      const colorsFromProduct = Array.from(
        new Map(
          product.variants.map((v: Variants) => [v.color.id, v.color])
        ).values()
      );
      setColors(colorsFromProduct);

      const sizesFromProduct = Array.from(
        new Map(
          product.variants.map((v: Variants) => [v.size.id, v.size])
        ).values()
      );
      setSizes(sizesFromProduct);

      setProduct(product);
      setIsSale(product.is_sale);

      // Map variants
      const mappedVariants = product.variants.map(
        (v: Variants, index: number) => ({
          id: v.id,
          sku: v.sku,
          color: v.color.name,
          size: v.size.name,
          color_id: v.color.id,
          size_id: v.size.id,
          quantity: Number(v.inventory?.quantity ?? 0),
          stock: Number(v.inventory?.stock ?? 0),
          sold_quantity: Number(v.inventory?.sold_quantity ?? 0),
          is_stock: Boolean(v.inventory?.is_stock ?? true),
          _uniqueKey: `${v.id}_${index}_${Date.now()}`,
        })
      );

      // Xử lý hình ảnh theo color
      const imageMap: Record<string, any[]> = {};
      product.images.forEach((img: any, index: number) => {
        const match = img.url.match(
          /([0-9a-fA-F\-]{36})_\d+\.(jpg|jpeg|png|webp)$/i
        );
        if (!match) return;

        const colorId = match[1];
        const variant = product.variants.find(
          (v: Variants) => v.color.id === colorId
        );
        if (!variant) return;

        const colorName = variant.color.name;
        const fileObj = {
          uid: img.id,
          name: `image-${index + 1}`,
          status: "done",
          url: img.url,
          thumbUrl: img.url,
          isThumbnail: img.is_thumbnail || false,
          sortOrder: img.sort_order ?? index + 1,
          isOld: true,
        };

        if (!imageMap[colorName]) {
          imageMap[colorName] = [];
        }
        imageMap[colorName].push(fileObj);
      });
      setColorImages(imageMap);

      // Set form values
      setTimeout(() => {
        const formValues = {
          title: product.title,
          slug: product.slug,
          description: product.description,
          price: product.price,
          is_sale: product?.is_sale,
          sale_price: product?.sale_price,
          start_sale: product?.start_sale ? dayjs(product.start_sale) : null,
          end_sale: product?.end_sale ? dayjs(product.end_sale) : null,
          tag_ids: product.tags.map((t: Tags) => t.id),
          category_ids: product.categories.map((c: Category) => c.id),
          variants: mappedVariants.map((v: Variants, index: any) => ({
            ...v,
            _index: index,
          })),
        };
        form.setFieldsValue(formValues);
      }, 100);
    } catch (error: any) {
      message.error(error);
    } finally {
      setLoadingOptions(false);
    }
  }, [productId, form]);

  const getSelectedColors = () => {
    const formValues = form.getFieldsValue();
    const attrs = formValues.variants || [];
    const selectedColors = [
      ...new Set(
        attrs.map((attr: { color?: string }) => attr?.color).filter(Boolean)
      ),
    ];
    return selectedColors;
  };

  useEffect(() => {
    getAndSetData();
  }, [getAndSetData]);

  const handleRestore = async () => {
    try {
      setIsLoading(true);
      const res = await restoreProduct(productId);
      message.success(res.data.message);
      router.push("/products/deleted");
    } catch (error: any) {
      message.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingOptions) {
    return (
      <div className="flex justify-center p-12">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-black">Chi tiết sản phẩm</h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleRestore}
        initialValues={{ is_sale: false, category_ids: [] }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item label="Tiêu đề" name="title">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Danh mục" name="category_ids">
            <Select mode="multiple" placeholder="Chọn danh mục" disabled>
              {categories.map((c: Category) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Tag" name="tag_ids">
            <Select mode="multiple" placeholder="Chọn tag" disabled>
              {tags.map((t: Tags) => (
                <Option key={t.id} value={t.id}>
                  {t.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <Form.Item label="Giá" name="price">
            <Input type="number" disabled />
          </Form.Item>

          <Form.Item label="Khuyến mãi" name="is_sale" valuePropName="checked">
            <Switch disabled />
          </Form.Item>
        </div>

        {isSale && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Form.Item label="Giá khuyến mãi" name="sale_price">
              <Input type="number" placeholder="Giá giảm" disabled />
            </Form.Item>

            <Form.Item label="Bắt đầu khuyến mãi" name="start_sale">
              <DatePicker className="w-full" format="YYYY-MM-DD" disabled />
            </Form.Item>

            <Form.Item label="Kết thúc khuyến mãi" name="end_sale">
              <DatePicker className="w-full" format="YYYY-MM-DD" disabled />
            </Form.Item>
          </div>
        )}

        <Form.Item label="Mô tả chi tiết" name="description">
          <Editor
            apiKey={apiKey}
            disabled={isDeletedProduct}
            init={{
              height: 400,
            }}
          />
        </Form.Item>

        <Form.Item label="Thuộc tính sản phẩm">
          <Form.List name="variants">
            {(fields) => (
              <>
                <div className="space-y-6">
                  {fields.map(({ key, name, ...restField }) => {
                    return (
                      <div
                        key={key}
                        className="relative space-y-4 border p-4 rounded-md"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                          <Form.Item
                            {...restField}
                            label="SKU"
                            name={[name, "sku"]}
                            rules={[{ required: true, message: "Nhập SKU" }]}
                            className="m-0"
                          >
                            <Input size="large" disabled />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            label="Size"
                            name={[name, "size"]}
                            rules={[{ required: true, message: "Chọn size" }]}
                            className="m-0"
                          >
                            <Select
                              placeholder="Chọn size"
                              size="large"
                              disabled
                            >
                              {sizes.map((s: Size) => (
                                <Option key={s.id} value={s.name}>
                                  {s.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            label="Màu"
                            name={[name, "color"]}
                            rules={[{ required: true, message: "Chọn màu" }]}
                            className="m-0"
                          >
                            <Select
                              placeholder="Chọn màu"
                              size="large"
                              disabled
                            >
                              {colors.map((c: Color) => (
                                <Option key={c.id} value={c.name}>
                                  {c.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            label="Số lượng"
                            name={[name, "quantity"]}
                            rules={[
                              { required: true, message: "Nhập số lượng" },
                            ]}
                            className="m-0"
                          >
                            <Input type="number" size="large" disabled />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            label="Đã bán"
                            name={[name, "sold_quantity"]}
                            className="m-0"
                          >
                            <Input type="number" size="large" disabled />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            label="Tồn kho"
                            name={[name, "stock"]}
                            className="m-0"
                          >
                            <Input type="number" size="large" disabled />
                          </Form.Item>

                          <Form.Item
                            label="Còn hàng"
                            name={[name, "is_stock"]}
                            valuePropName="checked"
                          >
                            <Switch disabled />
                          </Form.Item>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item label="Ảnh sản phẩm theo màu">
          <Form.Item
            shouldUpdate={(prev, cur) => prev.variants !== cur.variants}
          >
            {() => {
              const selectedColors = getSelectedColors();

              if (selectedColors.length === 0) {
                return (
                  <div className="text-gray-500 p-4 border border-dashed border-gray-300 rounded-lg text-center">
                    Vui lòng chọn màu trong thuộc tính sản phẩm để upload ảnh
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {selectedColors.map((colorName: any) => (
                    <ColorImageUpload
                      key={String(colorName)}
                      colorName={String(colorName)}
                      initialList={colorImages[String(colorName)] || []}
                      isDeletedProduct
                    />
                  ))}
                </div>
              );
            }}
          </Form.Item>
        </Form.Item>
        <div className="flex flex-col gap-5">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Ngày tạo">
              {new Date(product.created_at).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {product.created_by?.profile
                ? `${product.created_by.profile.first_name} ${product.created_by.profile.last_name}`
                : product.created_by?.username || "(Không rõ)"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày xóa">
              {new Date(product.updated_at).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Người xóa">
              {product.updated_by?.profile
                ? `${product.updated_by.profile.first_name} ${product.updated_by.profile.last_name}`
                : product.updated_by?.username || "(Không rõ)"}
            </Descriptions.Item>
          </Descriptions>

          <Form.Item>
            <Popconfirm
              title="Bạn có chắc muốn khôi phục sản phẩm này?"
              okText="Khôi phục"
              cancelText="Hủy"
              onConfirm={form.submit}
              disabled={isLoading}
            >
              <Button
                type="primary"
                icon={<RollbackOutlined />}
                className="bg-blue-500 flex items-center justify-center"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Đang khôi phục" : "Khôi phục"}
              </Button>
            </Popconfirm>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
