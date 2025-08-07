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
} from "antd";
import { getCategoriesNoChild, updateProduct } from "@/api/product";
import {
  Category,
  Color,
  Product,
  Size,
  Tags,
  Variants,
} from "@/types/product";
import { Editor } from "@tinymce/tinymce-react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import ColorImageUpload from "../create/components/UploadImage";
import { toPostgresTimestamp } from "@/utils/time";
import { useParams } from "next/navigation";
import { getProductById } from "@/api/product";
import dayjs from "dayjs";
import {
  getTagsNoChild,
  getColorsNoChild,
  getCategories,
  getSizesNoChild,
} from "@/api/product";

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
    id: undefined;
    sku: string;
    quantity: number;
    size: string;
    color: string;
    images?: UploadFile[];
  }>;
}

const { Option } = Select;
interface MyUploadFile extends UploadFile<any> {
  isOld?: boolean;
}

export default function EditProductPage() {
  const apiKey = process.env.NEXT_PUBLIC_TINY_MCE_API_KEY;

  const [form] = Form.useForm();

  const [product, setProduct] = useState<Product>();

  const [sizes, setSizes] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSale, setIsSale] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [deleteVariantIds, setDeleteVariantIds] = useState<string[]>([]);
  const [colorImages, setColorImages] = useState<
    Record<string, MyUploadFile[]>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const param = useParams();
  const productId = String(param.id);

  const getAndSetProperties = async () => {
    try {
      const [tagsRes, colorsRes, categoriesRes, sizesRes] = await Promise.all([
        getTagsNoChild(),
        getColorsNoChild(),
        getCategoriesNoChild(),
        getSizesNoChild(),
      ]);

      setTags(tagsRes.data.data.tags);
      setColors(colorsRes.data.data.colors);
      setCategories(categoriesRes.data.data.categories);
      setSizes(sizesRes.data.data.sizes);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const getAndSetProduct = useCallback(async () => {
    try {
      const res = await getProductById(productId);
      const product = res.data.data.product;
      setProduct(product);

      const uniqueColors = Array.from(
        new Map(
          product.variants.map((v: Variants) => [v.color.id, v.color])
        ).values()
      );
      const uniqueSizes = Array.from(
        new Map(
          product.variants.map((v: Variants) => [v.size.id, v.size])
        ).values()
      );

      const tagsData = product.tags;
      const categoriesData = product.categories;

      setTags(tagsData);
      setCategories(categoriesData);
      setColors(uniqueColors);
      setSizes(uniqueSizes);
      setIsSale(product.is_sale);
      setDescription(product.description);

      const mappedVariants = product.variants.map((v: Variants) => ({
        id: v.id,
        sku: v.sku,
        color: v.color.name,
        size: v.size.name,
        quantity: v.inventory?.stock ?? 0,
      }));

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

      setTimeout(() => {
        form.setFieldsValue({
          title: product.title,
          slug: product.slug,
          description: product.description,
          price: product.price,
          is_sale: product?.is_sale,
          sale_price: product?.sale_price,
          start_sale: product?.start_sale ? dayjs(product.start_sale) : null,
          end_sale: product?.end_sale ? dayjs(product.end_sale) : null,
          tag_ids: tagsData.map((t: Tags) => t.id),
          category_ids: categoriesData.map((c: Category) => c.id),
          variants: mappedVariants,
        });
      }, 10);
    } catch (error) {
      message.error("Không thể tải dữ liệu sản phẩm");
      console.error(error);
    } finally {
      setLoadingOptions(false);
    }
  }, [productId, form]);

  useEffect(() => {
    getAndSetProduct();
    getAndSetProperties();
  }, []);

  const handleColorImageChange = (
    colorName: string,
    info: { fileList: UploadFile[] }
  ) => {
    setColorImages((prev) => {
      const prevFiles = prev[colorName] || [];

      const deletedOldImages = prevFiles
        .filter((file) => file.isOld)
        .filter(
          (file) => !info.fileList.some((newFile) => newFile.uid === file.uid)
        );

      setDeletedImageIds((prevIds) => {
        const newIds = deletedOldImages
          .map((img) => img.uid!)
          .filter((id) => !prevIds.includes(id));

        return [...prevIds, ...newIds];
      });

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
    console.log("Form values:", values);
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

    deleteVariantIds.forEach((id) => {
      formData.append("delete_variant_ids", id);
    });

    let newIndex = 0;
    let updateIndex = 0;

    if (values.variants) {
      values.variants.forEach((variant) => {
        const formVariant = {
          sku: variant.sku,
          quantity: variant.quantity,
          color_id: colorMap[variant.color],
          size_id: sizeMap[variant.size],
        };

        if (variant.id !== undefined && variant.id !== null) {
          formData.append(`update_variants[${updateIndex}][id]`, variant.id);
          formData.append(`update_variants[${updateIndex}][sku]`, variant.sku);
          formData.append(
            `update_variants[${updateIndex}][quantity]`,
            String(variant.quantity)
          );
          formData.append(
            `update_variants[${updateIndex}][color_id]`,
            formVariant.color_id
          );
          formData.append(
            `update_variants[${updateIndex}][size_id]`,
            formVariant.size_id
          );
          updateIndex++;
        } else {
          formData.append(`new_variants[${newIndex}][sku]`, variant.sku);
          formData.append(
            `new_variants[${newIndex}][quantity]`,
            String(variant.quantity)
          );
          formData.append(
            `new_variants[${newIndex}][color_id]`,
            formVariant.color_id
          );
          formData.append(
            `new_variants[${newIndex}][size_id]`,
            formVariant.size_id
          );
          newIndex++;
        }
      });
    }

    deletedImageIds.forEach((id) => {
      formData.append("delete_image_ids", id);
    });

    values.update_images?.forEach((img: any, index: number) => {
      formData.append(`update_images[${index}][id]`, img.id);
      formData.append(
        `update_images[${index}][is_thumbnail]`,
        String(img.is_thumbnail)
      );
    });

    let newImageIndex = 0;
    const usedFiles = new Set();

    for (const [colorName, fileList] of Object.entries(colorImages)) {
      const color_id = colorMap[colorName];

      fileList.forEach((file, idx) => {
        const fileKey = file.uid || file.name;
        if (usedFiles.has(fileKey)) return;

        if (file.originFileObj) {
          formData.append(
            `new_images[${newImageIndex}][file]`,
            file.originFileObj
          );
          formData.append(
            `new_images[${newImageIndex}][color_id]`,
            String(color_id)
          );
          formData.append(
            `new_images[${newImageIndex}][is_thumbnail]`,
            idx === 0 ? "true" : "false"
          );
          formData.append(
            `new_images[${newImageIndex}][sort_order]`,
            String(idx + 1)
          );

          usedFiles.add(fileKey);
          newImageIndex++;
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

    try {
      setIsLoading(true);
      const res = await updateProduct(productId, formData);
      message.success(res.data.message);
      setDeletedImageIds([]);
      getAndSetProduct();
      // router.push("/products");
    } catch (error: any) {
      message.error(error.message);
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
        onFinish={onFinish}
        initialValues={{ is_sale: false, category_ids: [] }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Bắt buộc" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input disabled />
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

          <Form.Item label="Tag" name="tag_ids">
            <Select mode="multiple" placeholder="Chọn tag">
              {tags.map((t: Tags) => (
                <Option key={t.id} value={t.id}>
                  {t.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
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
        </div>

        {isSale && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Form.Item label="Giá khuyến mãi" name="sale_price">
              <Input type="number" placeholder="Giá giảm" />
            </Form.Item>

            <Form.Item label="Bắt đầu khuyến mãi" name="start_sale">
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item label="Kết thúc khuyến mãi" name="end_sale">
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>
          </div>
        )}

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
              height: 400,
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
                        onClick={() => {
                          const variant = form.getFieldValue([
                            "variants",
                            name,
                          ]);
                          if (variant?.id) {
                            setDeleteVariantIds((prev) => [
                              ...prev,
                              variant.id,
                            ]);
                          }
                          remove(name);
                        }}
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
            <Descriptions.Item label="Ngày cập nhật">
              {new Date(product.updated_at).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Người cập nhật">
              {product.updated_by?.profile
                ? `${product.updated_by.profile.first_name} ${product.updated_by.profile.last_name}`
                : product.updated_by?.username || "(Không rõ)"}
            </Descriptions.Item>
          </Descriptions>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-500 flex items-center justify-center"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Đang cập nhật" : "Cập nhật"}
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
