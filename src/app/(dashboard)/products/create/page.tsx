/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Switch,
  DatePicker,
  Spin,
  UploadFile as AntdUploadFile,
} from "antd";

import { memo } from "react";
import { useRouter } from "next/navigation";
import {
  createProduct,
  getCategoriesNoChild,
  getColorsNoChild,
  getSizesNoChild,
  getTagsNoChild,
} from "@/api/product";
import { Category, Color, Size, Tags } from "@/types/product";
import { Editor } from "@tinymce/tinymce-react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import ColorImageUpload, {
  CustomUploadFile,
} from "./components/ColorImageUpload";
import { toPostgresTimestamp } from "@/utils/time";
import { messageApiRef } from "@/components/layout/MessageProvider";

export interface ProductFormValues {
  title: string;
  category_ids: string[];
  image: string;
  description?: string;
  price: number;
  is_sale: boolean;
  is_active: boolean;
  sale_price?: number;
  start_sale?: string;
  end_sale?: string;
  size?: string;
  color?: string;
  tag_ids?: string[];
  variants?: Array<{
    sku: string;
    quantity: number;
    size: string;
    color: string;
    images?: CustomUploadFile[];
  }>;
}

const { Option } = Select;

const CreateProductPage = () => {
  const apiKey = process.env.NEXT_PUBLIC_TINY_MCE_API_KEY;

  const router = useRouter();
  const [form] = Form.useForm();

  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSale, setIsSale] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isHaveThumbnail, setIsHaveThumbnail] = useState(false);

  const [colorImages, setColorImages] = useState<
    Record<string, CustomUploadFile[]>
  >({});

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [s, c, t, cat] = await Promise.all([
          getSizesNoChild(),
          getColorsNoChild(),
          getTagsNoChild(),
          getCategoriesNoChild(),
        ]);
        setSizes(s.data.data.sizes);
        setColors(c.data.data.colors);
        setTags(t.data.data.tags);
        setCategories(cat.data.data.categories);
      } catch {
        messageApiRef.error("Không thể tải thuộc tính sản phẩm");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleColorImageChange = (
    colorName: string,
    info: { fileList: CustomUploadFile[] }
  ) => {
    setColorImages((prev: any) => {
      const uniqueFiles = Array.from(
        new Map(
          info.fileList.map((file) => [
            file.uid,
            { ...file, status: file.status || "done" },
          ])
        ).values()
      );

      return {
        ...prev,
        [colorName]: uniqueFiles,
      };
    });
  };

  const handleSetThumbnail = (colorName: string, uid: string) => {
    setIsHaveThumbnail(true);
    setColorImages((prev) => {
      const updated: typeof prev = {};

      Object.keys(prev).forEach((c) => {
        updated[c] = prev[c].map((file) => ({
          ...file,
          isThumbnail: c === colorName && file.uid === uid,
        }));
      });

      return updated;
    });

    setTimeout(() => {
      form.validateFields(["colorImages"]);
    }, 100);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      form.validateFields(["colorImages"]);
    }, 300);

    return () => clearTimeout(timer);
  }, [colorImages]);

  // FIX 2: Thêm function để clean up ảnh khi xóa variant
  const cleanupImagesForRemovedVariants = () => {
    const selectedColors = getSelectedColors();

    setColorImages((prev) => {
      const updated: typeof prev = {};

      // Chỉ giữ lại ảnh của những màu còn được chọn
      selectedColors.forEach((colorName: string) => {
        if (prev[colorName]) {
          updated[colorName] = prev[colorName];
        }
      });

      return updated;
    });
  };

  // FIX 2: Thêm useEffect để theo dõi khi variants thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      cleanupImagesForRemovedVariants();
      form.validateFields(["colorImages"]);
    }, 300);

    return () => clearTimeout(timer);
  }, [form.getFieldsValue().variants]); // Theo dõi thay đổi của variants

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

  // FIX 2: Cập nhật hàm remove variant để cleanup ảnh ngay lập tức
  const handleRemoveVariant = (
    name: number,
    remove: (index: number) => void
  ) => {
    const variant = form.getFieldValue(["variants", name]);
    const removedColor = variant?.color;

    // Xóa variant trước
    remove(name);

    // Sau khi xóa variant, kiểm tra xem còn variant nào dùng color này không
    setTimeout(() => {
      const formValues = form.getFieldsValue();
      const remainingVariants = formValues.variants || [];
      const remainingColors = remainingVariants
        .map((attr: { color?: string }) => attr?.color)
        .filter(Boolean);

      // Nếu không còn variant nào dùng color đã xóa, xóa ảnh của color đó
      if (removedColor && !remainingColors.includes(removedColor)) {
        setColorImages((prev) => {
          const updated = { ...prev };
          delete updated[removedColor];
          return updated;
        });
      }

      // Validate lại form
      form.validateFields(["colorImages"]);
    }, 100);
  };

  const onFinish = async (values: ProductFormValues) => {
    if (
      values.is_sale &&
      (!values.sale_price || !values.start_sale || !values.end_sale)
    ) {
      messageApiRef.warning("Vui lòng điền đầy đủ thông tin khuyến mãi!");
      return;
    }

    const formData = new FormData();

    const colorMap = colors.reduce((acc, c) => {
      acc[c.name] = c.id;
      return acc;
    }, {} as Record<string, string>);

    const sizeMap = sizes.reduce((acc, s) => {
      acc[s.name] = s.id;
      return acc;
    }, {} as Record<string, string>);

    // Append các field cơ bản
    formData.append("title", values.title);
    formData.append("price", String(values.price));
    formData.append("is_sale", String(values.is_sale));
    formData.append("is_active", String(values.is_active));

    formData.append("description", description);
    if (values.sale_price)
      formData.append("sale_price", String(values.sale_price));
    if (values.start_sale) {
      formData.append("start_sale", toPostgresTimestamp(values.start_sale));
    }

    if (values.end_sale) {
      formData.append("end_sale", toPostgresTimestamp(values.end_sale));
    }

    values.tag_ids?.forEach((id) => {
      formData.append("tag_ids", String(id));
    });

    values.category_ids.forEach((id) =>
      formData.append("category_ids", String(id))
    );

    // Append variants
    values.variants?.forEach((attr, index) => {
      formData.append(`variants[${index}][sku]`, attr.sku);
      formData.append(`variants[${index}][quantity]`, String(attr.quantity));
      formData.append(
        `variants[${index}][color_id]`,
        String(colorMap[attr.color])
      );
      formData.append(
        `variants[${index}][size_id]`,
        String(sizeMap[attr.size])
      );
    });

    // Append images theo màu
    let imageIndex = 0;
    const usedFiles = new Set();

    for (const [colorName, fileList] of Object.entries(colorImages)) {
      const color_id = colorMap[colorName];

      fileList.forEach((file, idx) => {
        const fileKey = file.uid || file.name;

        if (usedFiles.has(fileKey)) return;

        if (file.originFileObj) {
          formData.append(`images[${imageIndex}][file]`, file.originFileObj);
          formData.append(`images[${imageIndex}][color_id]`, String(color_id));
          formData.append(
            `images[${imageIndex}][is_thumbnail]`,
            file.isThumbnail ? "true" : "false"
          );
          formData.append(`images[${imageIndex}][sort_order]`, String(idx + 1));
          imageIndex++;

          usedFiles.add(fileKey);
        }
      });
    }

    const formDataObj: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      if (formDataObj[key]) {
        if (Array.isArray(formDataObj[key])) {
          formDataObj[key].push(value);
        } else {
          formDataObj[key] = [formDataObj[key], value];
        }
      } else {
        formDataObj[key] = value;
      }
    });

    if (!isHaveThumbnail) {
      messageApiRef.error("Vui lòng chọn thumbnail");
      return;
    }

    try {
      setIsLoading(true);
      const res = await createProduct(formData);
      messageApiRef.success(res.data.message);
      router.push(`/products/${res.data.data.id}`);
    } catch (error) {
      console.error(error);
      messageApiRef.error("Tạo sản phẩm thất bại");
    } finally {
      setIsLoading(false);
      setIsHaveThumbnail(false);
    }
  };

  if (loadingOptions) {
    return (
      <div className="flex justify-center p-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-black">Tạo sản phẩm</h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ is_sale: false, is_active: true, category_ids: [] }}
        className="space-y-4"
      >
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Danh mục"
          name="category_ids"
          rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
        >
          <Select mode="multiple" placeholder="Chọn danh mục">
            {categories.map((c: Category) => (
              <Option key={c.id} value={c.id}>
                {c.name}
                <div className="text-xs ml-3 inline-block text-gray-600">
                  ({c.slug})
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Mô tả chi tiết"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập mô tả chi tiết" }]}
          validateStatus={!form.getFieldValue("description") ? "error" : ""}
          help={
            !form.getFieldValue("description")
              ? "Vui lòng nhập mô tả chi tiết"
              : ""
          }
        >
          <Editor
            apiKey={apiKey}
            onEditorChange={(content) => {
              setDescription(content);
            }}
            init={{
              height: 500,
              menubar: true,
              paste_data_images: false,
              toolbar:
                "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
              tinycomments_mode: "embedded",
              tinycomments_author: "Author name",
              ai_request: (
                request: unknown,
                respondWith: {
                  string: (arg0: () => Promise<never>) => unknown;
                }
              ) =>
                respondWith.string(() =>
                  Promise.reject("See docs to implement AI Assistant")
                ),
            }}
          />
        </Form.Item>

        <Form.Item
          label="Giá"
          name="price"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <Input type="number" min={1000} />
        </Form.Item>

        <Form.Item label="Mở bán" name="is_active" valuePropName="checked">
          <Switch onChange={(val) => setIsActive(val)} />
        </Form.Item>

        <Form.Item label="Khuyến mãi" name="is_sale" valuePropName="checked">
          <Switch onChange={(val) => setIsSale(val)} />
        </Form.Item>

        {isSale && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item label="Giá khuyến mãi" name="sale_price">
                <Input type="number" min={1000} />
              </Form.Item>

              <Form.Item label="Bắt đầu khuyến mãi" name="start_sale">
                <DatePicker className="w-full" format="YYYY-MM-DD" />
              </Form.Item>

              <Form.Item label="Kết thúc khuyến mãi" name="end_sale">
                <DatePicker className="w-full" format="YYYY-MM-DD" />
              </Form.Item>
            </div>
          </>
        )}

        <Form.Item label="Thuộc tính sản phẩm">
          <Form.List
            name="variants"
            rules={[
              {
                validator: async (_, variants) => {
                  if (!variants || variants.length < 1) {
                    return Promise.reject(
                      new Error("Vui lòng thêm ít nhất 1 thuộc tính")
                    );
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                <div className="space-y-6">
                  {fields.map(({ key, name, ...restField }) => {
                    return (
                      <div
                        key={key}
                        className="relative space-y-4 border p-4 rounded-md"
                      >
                        {/* Icon xoá ở góc phải trên */}
                        <MinusCircleOutlined
                          onClick={() => handleRemoveVariant(name, remove)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl cursor-pointer"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
                          <Form.Item
                            {...restField}
                            label="SKU"
                            name={[name, "sku"]}
                            rules={[{ required: true, message: "Nhập SKU" }]}
                            className="m-0"
                          >
                            <Input size="large" />
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
                            <Input size="large" min={0} className="w-full" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            label="Size"
                            name={[name, "size"]}
                            rules={[{ required: true, message: "Chọn size" }]}
                            className="m-0"
                          >
                            <Select placeholder="Chọn size" size="large">
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
                              onChange={() => {
                                // Trigger form validation after color change
                                setTimeout(() => {
                                  form.validateFields();
                                }, 100);
                              }}
                            >
                              {colors.map((c: Color) => (
                                <Option key={c.id} value={c.name}>
                                  {c.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      add({
                        sku: "",
                        size: undefined,
                        color: undefined,
                        quantity: 0,
                        sold_quantity: 0,
                        stock: 0,
                        is_stock: true,
                        _uniqueKey: `new_${Date.now()}_${Math.random()}`,
                      });
                    }}
                  >
                    Thêm thuộc tính
                  </Button>
                </div>
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item
          label="Ảnh sản phẩm theo màu"
          name="colorImages"
          rules={[
            {
              validator: () => {
                const selectedColors = getSelectedColors();
                const totalImages = Object.values(colorImages || {}).reduce(
                  (sum, list) => sum + list.length,
                  0
                );

                if (selectedColors.length === 0) {
                  return Promise.reject(
                    new Error("Vui lòng thêm ít nhất 1 thuộc tính sản phẩm")
                  );
                }

                if (totalImages === 0) {
                  return Promise.reject(
                    new Error("Vui lòng chọn ít nhất 1 ảnh")
                  );
                }

                for (const colorName of selectedColors) {
                  const colorImagesList = colorImages[String(colorName)] || [];
                  if (colorImagesList.length === 0) {
                    return Promise.reject(
                      new Error(
                        `Vui lòng chọn ít nhất 1 ảnh cho màu ${colorName}`
                      )
                    );
                  }
                }

                return Promise.resolve();
              },
            },
          ]}
        >
          <Form.Item
            shouldUpdate={(prev, cur) => prev.variants !== cur.variants}
            noStyle
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
                  {selectedColors.map((colorName) => (
                    <ColorImageUpload
                      key={String(colorName)}
                      colorName={String(colorName)}
                      initialList={colorImages[String(colorName)] || []}
                      handleColorImageChange={handleColorImageChange}
                      onSetThumbnail={handleSetThumbnail}
                    />
                  ))}
                </div>
              );
            }}
          </Form.Item>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => {
            const variantsChanged = prev.variants !== cur.variants;
            const colorImagesChanged =
              JSON.stringify(prev._colorImages) !==
              JSON.stringify(cur._colorImages);
            return variantsChanged || colorImagesChanged;
          }}
        >
          {() => {
            const variants = form.getFieldValue("variants") || [];
            const selectedColors = getSelectedColors();

            const validationErrors: string[] = [];

            if (variants.length === 0) {
              validationErrors.push(
                "Vui lòng thêm ít nhất 1 thuộc tính sản phẩm"
              );
            }

            if (selectedColors.length > 0) {
              const totalImages = Object.values(colorImages || {}).reduce(
                (sum, list) => sum + list.length,
                0
              );

              if (totalImages === 0) {
                validationErrors.push("Vui lòng chọn ít nhất 1 ảnh");
              } else {
                for (const colorName of selectedColors) {
                  const colorImagesList = colorImages[String(colorName)] || [];
                  if (colorImagesList.length === 0) {
                    validationErrors.push(`Màu ${colorName} chưa có ảnh`);
                  }
                }
              }
            }

            if (validationErrors.length > 0) {
              return (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="text-red-600 text-sm">
                    <div className="font-medium mb-1">Cần hoàn thiện:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            }

            return null;
          }}
        </Form.Item>

        <Form.Item
          label="Tag"
          name="tag_ids"
          rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 tag" }]}
        >
          <Select mode="multiple" placeholder="Chọn tag">
            {tags.map((t: Tags) => (
              <Option key={t.id} value={t.id}>
                {t.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item className="pt-4">
          <Button
            type="primary"
            htmlType="submit"
            className="bg-blue-500"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý " : "Tạo sản phẩm"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default memo(CreateProductPage);
