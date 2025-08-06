"use client";

import { useEffect, useState } from "react";
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
} from "antd";
import { useRouter } from "next/navigation";
import {
  createProduct,
  getCategories,
  getProductColors,
  getProductSizes,
  getProductTags,
} from "@/api/product";
import { Category, Color, Size, Tags } from "@/types/product";
import { Editor } from "@tinymce/tinymce-react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import ColorImageUpload from "./components/UploadImage";
import { toPostgresTimestamp } from "@/utils/time";

export interface ProductFormValues {
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
    sku: string;
    quantity: number;
    size: string;
    color: string;
    images?: UploadFile[];
  }>;
}

const { Option } = Select;

export default function CreateProductPage() {
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

  const [colorImages, setColorImages] = useState<Record<string, UploadFile[]>>(
    {}
  );

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [s, c, t, cat] = await Promise.all([
          getProductSizes(),
          getProductColors(),
          getProductTags(),
          getCategories(),
        ]);
        setSizes(s.data.data.sizes);
        setColors(c.data.data.colors);
        setTags(t.data.data.tags);
        setCategories(cat.data.data.categories);
      } catch {
        message.error("Không thể tải thuộc tính sản phẩm");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleColorImageChange = (
    colorName: string,
    info: { fileList: UploadFile[] }
  ) => {
    const existingFiles = new Set<string>();
    const filteredList: UploadFile[] = [];

    info.fileList.forEach((file, index) => {
      const fileKey = file.uid || file.name;
      if (!existingFiles.has(fileKey)) {
        filteredList.push({
          ...file,
          uid: file.uid || `${colorName}-${Date.now()}-${index}`,
          status: file.status || "done",
        });
        existingFiles.add(fileKey);
      }
    });

    setColorImages((prev) => ({
      ...prev,
      [colorName]: filteredList,
    }));
  };

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

  const onFinish = async (values: ProductFormValues) => {
    if (
      values.is_sale &&
      (!values.sale_price || !values.start_sale || !values.end_sale)
    ) {
      message.warning("Vui lòng điền đầy đủ thông tin khuyến mãi!");
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
            idx === 0 ? "true" : "false"
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

    console.log("typeof description:", typeof values.description); // 👈 phải là "string"
    console.log("description value:", values.description);

    try {
      const res = await createProduct(formData);

      console.log(res.data.data);

      message.success(res.data.message);
      router.push("/products");
    } catch (error) {
      console.error(error);
      message.error("Tạo sản phẩm thất bại");
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
        initialValues={{ is_sale: false, category_ids: [] }}
        className="space-y-4"
      >
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Danh mục" name="category_ids">
          <Select mode="multiple" placeholder="Chọn danh mục">
            {categories.map((c: Category) => (
              <Option key={c.id} value={c.id}>
                {c.name}
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
              plugins: [
                "anchor",
                "autolink",
                "charmap",
                "codesample",
                "emoticons",
                "image",
                "link",
                "lists",
                "media",
                "searchreplace",
                "table",
                "visualblocks",
                "wordcount",
                "checklist",
                "mediaembed",
                "casechange",
                "formatpainter",
                "pageembed",
                "a11ychecker",
                "tinymcespellchecker",
                "permanentpen",
                "powerpaste",
                "advtable",
                "advcode",
                "editimage",
                "advtemplate",
                "ai",
                "mentions",
                "tinycomments",
                "tableofcontents",
                "footnotes",
                "mergetags",
                "typography",
                "inlinecss",
                "markdown",
                "importword",
                "exportword",
                "exportpdf",
              ],
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
          <Input type="number" />
        </Form.Item>

        <Form.Item label="Khuyến mãi" name="is_sale" valuePropName="checked">
          <Switch onChange={(val) => setIsSale(val)} />
        </Form.Item>

        {isSale && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item label="Giá khuyến mãi" name="sale_price">
                <Input type="number" placeholder="Giá giảm" />
              </Form.Item>

              <Form.Item label="Bắt đầu khuyến mãi" name="start_sale">
                <DatePicker
                  className="w-full"
                  showTime
                  format="YYYY-MM-DD H:mm"
                />
              </Form.Item>

              <Form.Item label="Kết thúc khuyến mãi" name="end_sale">
                <DatePicker
                  className="w-full"
                  showTime
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>
            </div>
          </>
        )}

        <Form.Item label="Thuộc tính sản phẩm">
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-2">
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                  >
                    Thêm thuộc tính
                  </Button>
                </div>

                <div className="space-y-6">
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      className="relative space-y-4 border p-4 rounded-md"
                    >
                      {/* Icon xoá ở góc phải trên */}
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
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
                          rules={[{ required: true, message: "Nhập số lượng" }]}
                          className="m-0"
                        >
                          <Input type="number" size="large" />
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
                  ))}
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
                  {selectedColors.map((colorName) => (
                    <ColorImageUpload
                      key={String(colorName)}
                      colorName={String(colorName)}
                      initialList={colorImages[String(colorName)] || []}
                      handleColorImageChange={handleColorImageChange}
                    />
                  ))}
                </div>
              );
            }}
          </Form.Item>
        </Form.Item>

        <Form.Item label="Tag" name="tag_ids">
          <Select mode="multiple" placeholder="Chọn tag">
            {tags.map((t: Tags) => (
              <Option key={t.id} value={t.id}>
                {t.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item className="pt-4">
          <Button type="primary" htmlType="submit" className="bg-blue-500">
            Tạo sản phẩm
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
