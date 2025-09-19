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
  Flex,
  Popconfirm,
} from "antd";
import {
  deleteProduct,
  getCategoriesNoChild,
  updateProduct,
} from "@/api/product";
import {
  Category,
  Color,
  Product,
  Size,
  Tags,
  Variants,
} from "@/types/product";
import { Editor } from "@tinymce/tinymce-react";
import {
  DeleteOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import ColorImageUpload, {
  CustomUploadFile,
} from "../create/components/ColorImageUpload";
import { toPostgresTimestamp } from "@/utils/time";
import { useParams } from "next/navigation";
import { getProductById } from "@/api/product";
import dayjs from "dayjs";
import {
  getTagsNoChild,
  getColorsNoChild,
  getSizesNoChild,
} from "@/api/product";
import isEqual from "lodash/isEqual";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { messageApiRef } from "@/components/layout/MessageProvider";
import { getImageByProductId } from "@/api/product";
import { useEventStore } from "@/stores/useEventStore";

export interface ProductFormValues {
  update_images: any;
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
  sortOrder: number | undefined;
  isThumbnail: any;
  isOld?: boolean;
}

export default function EditProductPage() {
  const apiKey = process.env.NEXT_PUBLIC_TINY_MCE_API_KEY;

  const [form] = Form.useForm();

  const [product, setProduct] = useState<Product>();
  const [originalData, setOriginalData] = useState<any>(null);
  const [sizes, setSizes] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [tags, setTags] = useState<Tags[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSale, setIsSale] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [deleteVariantIds, setDeleteVariantIds] = useState<string[]>([]);
  const [imageList, setImageList] = useState<MyUploadFile[]>([]);
  const [colorImages, setColorImages] = useState<
    Record<string, MyUploadFile[]>
  >({});
  const [variantColorHistory, setVariantColorHistory] = useState<
    Record<number, string>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [dataInitialized, setDataInitialized] = useState<boolean>(false);

  const { isCreating, isUploading, connectSSE, setCreating } = useEventStore();

  const param = useParams();
  const productId = String(param.id);
  const router = useRouter();

  useEffect(() => {
    if (isCreating) {
      connectSSE(productId, "product");
      setCreating(false);
    }
  }, [connectSSE, isCreating, productId, setCreating]);

  // Fetch product detail on mount
  useEffect(() => {
    fetchProductDetail();
  }, []);

  // Process images when imageList changes and product is available
  const processImageList = useCallback(
    (images: any[], productData?: Product) => {
      if (!images.length || !productData?.variants) {
        return {};
      }

      const imageMap: Record<string, any[]> = {};

      images.forEach((img: any, index: number) => {
        const colorId = img.color?.id;
        if (!colorId) return;

        const variant = productData.variants.find(
          (v: Variants) => v.color?.id === colorId
        ) as Variants | undefined;
        if (!variant) return;

        const colorName = variant.color?.name ?? `unknown-color-${colorId}`;
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

      return imageMap;
    },
    []
  );

  const fetchProductDetail = async () => {
    try {
      const res = await getProductById(productId);
      messageApiRef.success(res.data.message);
      setProduct(res.data.data.product);
    } catch (error: any) {
      messageApiRef.error(error);
    }
  };

  const fetchImageByProductId = async () => {
    if (!product) {
      return [];
    }

    try {
      const res = await getImageByProductId(productId);
      const images = res.data.data.images || [];

      setImageList(images);

      // Process images immediately if product is available
      const newColorImages = processImageList(images, product);
      setColorImages(newColorImages);

      return images;
    } catch (error) {
      messageApiRef.error(error);
      return [];
    }
  };

  const handleBack = () => {
    router.push("/products");
  };

  // Initialize all data when product is available
  const getAndSetData = useCallback(async () => {
    if (!product || dataInitialized) return;

    try {
      const [tagsRes, colorsRes, categoriesRes, sizesRes] = await Promise.all([
        getTagsNoChild(),
        getColorsNoChild(),
        getCategoriesNoChild(),
        getSizesNoChild(),
      ]);

      const mergedTags = [
        ...(tagsRes.data.data.tags || []),
        ...(product?.tags?.filter(
          (t: Tags) =>
            !(tagsRes.data.data.tags || []).some(
              (apiT: Tags) => apiT.id === t.id
            )
        ) || []),
      ];

      const mergedCategories = [
        ...(categoriesRes.data.data.categories || []),
        ...(product?.categories?.filter(
          (c: Category) =>
            !(categoriesRes.data.data.categories || []).some(
              (apiC: Category) => apiC.id === c.id
            )
        ) || []),
      ];

      const uniqueColorsFromProduct = Array.from(
        new Map(
          (product?.variants || []).map((v: Variants) => [v.color.id, v.color])
        ).values()
      );

      const mergedColors = [
        ...(colorsRes.data.data.colors || []),
        ...uniqueColorsFromProduct.filter(
          (c: any) =>
            !(colorsRes.data.data.colors || []).some(
              (apiC: any) => apiC.id === c.id
            )
        ),
      ];

      const uniqueSizesFromProduct = Array.from(
        new Map(
          (product?.variants || []).map((v: Variants) => [v.size.id, v.size])
        ).values()
      );

      const mergedSizes = [
        ...(sizesRes.data.data.sizes || []),
        ...uniqueSizesFromProduct.filter(
          (s: any) =>
            !(sizesRes.data.data.sizes || []).some(
              (apiS: any) => apiS.id === s.id
            )
        ),
      ];

      setTags(mergedTags);
      setCategories(mergedCategories);
      setColors(mergedColors);
      setSizes(mergedSizes);
      setIsSale(product.is_sale || false);
      setIsActive(product.is_active || true);
      setDescription(product.description || "");

      const mappedVariants = (product?.variants || []).map(
        (v: Variants, index: number) => ({
          id: v.id,
          sku: v.sku || "",
          color: v.color?.name ?? "",
          size: v.size?.name ?? "",
          color_id: v.color?.id ?? null,
          size_id: v.size?.id ?? null,
          quantity: Number(v.inventory?.quantity ?? 0),
          stock: Number(v.inventory?.stock ?? 0),
          sold_quantity: Number(v.inventory?.sold_quantity ?? 0),
          is_stock: Boolean(v.inventory?.is_stock ?? true),
          _uniqueKey: `${v.id}_${index}_${Date.now()}`,
        })
      );

      // Fetch images after setting up other data
      let imageMap: Record<string, any[]> = {};

      if (!isCreating) {
        const images = await fetchImageByProductId();
        imageMap = processImageList(images, product);
      }

      const initialObj = {
        title: product.title || "",
        price: product.price || 0,
        is_sale: Boolean(product.is_sale),
        is_active: Boolean(product.is_active),
        sale_price:
          product.sale_price === undefined ? null : product.sale_price,
        start_sale:
          product.start_sale === undefined ? null : product.start_sale,
        end_sale: product.end_sale === undefined ? null : product.end_sale,
        description: product.description || "",
        tag_ids: (product.tags || []).map((t: Tags) => t.id),
        category_ids: (product.categories || []).map((c: Category) => c.id),
        variants: mappedVariants,
        colorImages: imageMap,
      };

      setOriginalData(initialObj);

      // Set variant color history
      const initialHistory: Record<number, string> = {};
      mappedVariants.forEach((variant: any, index: number) => {
        if (variant.color) {
          initialHistory[index] = variant.color;
        }
      });
      setVariantColorHistory(initialHistory);

      // Set form values
      setTimeout(() => {
        const formValues = {
          title: product.title || "",
          slug: product.slug || "",
          description: product.description || "",
          price: product.price || 0,
          is_sale: Boolean(product?.is_sale),
          is_active: Boolean(product?.is_active),
          sale_price: product?.sale_price || null,
          start_sale: product?.start_sale ? dayjs(product.start_sale) : null,
          end_sale: product?.end_sale ? dayjs(product.end_sale) : null,
          tag_ids: [...(product.tags || []).map((t: Tags) => t.id)],
          category_ids: [
            ...(product.categories || []).map((c: Category) => c.id),
          ],
          variants: mappedVariants.map((v: any, index: any) => ({
            ...v,
            _index: index,
          })),
        };
        form.setFieldsValue(formValues);
      }, 100);

      setDataInitialized(true);
    } catch (error: any) {
      messageApiRef.error(error);
    } finally {
      setLoadingOptions(false);
    }
  }, [product, form, processImageList, isCreating, dataInitialized]);

  // Initialize data when product is available
  useEffect(() => {
    if (product && !dataInitialized) {
      getAndSetData();
    }
  }, [product, getAndSetData, dataInitialized]);

  // Handle SSE completion - fetch images when upload is complete
  useEffect(() => {
    if (!isCreating && !isUploading && product && dataInitialized) {
      fetchImageByProductId();
      setIsLoading(false);
    }
  }, [isCreating, isUploading, product, dataInitialized]);

  const handleColorChangeForVariant = (
    oldColor: string,
    newColor: string,
    variantIndex: number
  ) => {
    if (!oldColor || oldColor === newColor) return;

    // Kiểm tra xem màu cũ có còn được sử dụng bởi variant khác không
    const allVariants = form.getFieldValue("variants") || [];
    const otherVariantsUsingOldColor = allVariants.some(
      (variant: any, index: number) =>
        index !== variantIndex &&
        (variant?.color === oldColor || variantColorHistory[index] === oldColor)
    );

    // Nếu màu cũ không còn được sử dụng, xóa tất cả ảnh của màu đó
    if (!otherVariantsUsingOldColor) {
      const oldColorImages = colorImages[oldColor] || [];

      // Thêm tất cả ảnh cũ vào danh sách xóa
      const oldImageIds = oldColorImages
        .filter((img) => img.isOld && img.uid)
        .map((img) => img.uid);

      if (oldImageIds.length > 0) {
        setDeletedImageIds((prev) => [...prev, ...oldImageIds]);
      }

      // Xóa ảnh khỏi colorImages
      setColorImages((prev) => {
        const updated = { ...prev };
        delete updated[oldColor];
        return updated;
      });
    }

    // Kiểm tra nếu màu mới đã từng có ảnh trong originalData và bị xóa
    if (originalData?.colorImages?.[newColor]) {
      const originalImagesForNewColor = originalData.colorImages[newColor];

      // Khôi phục ảnh từ deletedImageIds nếu có
      const imageIdsToRestore = originalImagesForNewColor
        .filter((img: any) => img.uid)
        .map((img: any) => img.uid);

      if (imageIdsToRestore.length > 0) {
        // Loại bỏ khỏi deletedImageIds
        setDeletedImageIds((prev) =>
          prev.filter((id) => !imageIdsToRestore.includes(id))
        );

        // Khôi phục ảnh vào colorImages
        setColorImages((prev) => ({
          ...prev,
          [newColor]: originalImagesForNewColor.map((img: any) => ({
            ...img,
            isOld: true,
          })),
        }));
      }
    } else {
      // Nếu màu mới chưa có ảnh, khởi tạo mảng rỗng
      setColorImages((prev) => {
        if (!prev[newColor]) {
          return {
            ...prev,
            [newColor]: [],
          };
        }
        return prev;
      });
    }
  };

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

  const cleanupImagesForRemovedVariants = () => {
    const selectedColors = getSelectedColors();

    setColorImages((prev) => {
      const updated: typeof prev = {};

      selectedColors.forEach((colorName: string) => {
        if (prev[colorName]) {
          updated[colorName] = prev[colorName];
        }
      });

      return updated;
    });
  };

  const handleImageRemove = (imageId: string) => {
    setDeletedImageIds((prev) => {
      if (!prev.includes(imageId)) {
        return [...prev, imageId];
      }
      return prev;
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      cleanupImagesForRemovedVariants();
      form.validateFields(["colorImages"]);
    }, 300);

    return () => clearTimeout(timer);
  }, [form.getFieldsValue().variants]);

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

  const handleRemoveVariant = (
    name: number,
    remove: (index: number) => void
  ) => {
    const variant = form.getFieldValue(["variants", name]);
    const removedColor = variant?.color || variantColorHistory[name];

    remove(name);

    // Xóa khỏi history
    setVariantColorHistory((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });

    setTimeout(() => {
      const formValues = form.getFieldsValue();
      const remainingVariants = formValues.variants || [];
      const remainingColors = [
        ...remainingVariants
          .map((attr: { color?: string }) => attr?.color)
          .filter(Boolean),
        ...Object.values(variantColorHistory).filter(
          (color) => color && color !== removedColor
        ),
      ];

      if (removedColor && !remainingColors.includes(removedColor)) {
        // Thêm tất cả ảnh của màu bị xóa vào danh sách xóa
        const removedColorImages = colorImages[removedColor] || [];
        const imageIdsToDelete = removedColorImages
          .filter((img) => img.isOld && img.uid)
          .map((img) => img.uid);

        if (imageIdsToDelete.length > 0) {
          setDeletedImageIds((prev) => [...prev, ...imageIdsToDelete]);
        }

        setColorImages((prev) => {
          const updated = { ...prev };
          delete updated[removedColor];
          return updated;
        });
      }

      form.validateFields(["colorImages"]);
    }, 100);
  };

  const normalizeValue = (value: any) => {
    if (typeof value === "string") {
      return value.replace(/\r\n/g, "\n");
    }
    return value;
  };

  const onFinish = async (values: ProductFormValues) => {
    if (
      values.is_sale &&
      (!values.sale_price || !values.start_sale || !values.end_sale)
    ) {
      message.warning("Vui lòng điền đầy đủ thông tin khuyến mãi!");
      return;
    }

    if (!originalData) {
      message.error("Dữ liệu gốc chưa được tải!");
      return;
    }

    const colorMap = colors.reduce((acc, c) => {
      acc[c.name] = c.id;
      return acc;
    }, {} as Record<string, string>);

    const sizeMap = sizes.reduce((acc, s) => {
      acc[s.name] = s.id;
      return acc;
    }, {} as Record<string, string>);

    // Khởi tạo FormData
    const formData = new FormData();
    let hasChanges = false;

    // Helper function để thêm vào formData và đánh dấu có thay đổi
    const appendIfChanged = (key: string, newValue: any, oldValue: any) => {
      const normalizedNew = normalizeValue(newValue);
      const normalizedOld = normalizeValue(oldValue);

      if (!isEqual(normalizedNew, normalizedOld)) {
        if (normalizedNew !== null && normalizedNew !== undefined) {
          formData.append(key, String(newValue));
          hasChanges = true;
        }
      }
    };

    // Kiểm tra thay đổi các field cơ bản (giữ nguyên logic cũ)
    appendIfChanged("title", values.title, originalData.title);
    appendIfChanged("price", values.price, originalData.price);
    appendIfChanged("is_sale", values.is_sale, originalData.is_sale);
    appendIfChanged("is_active", values.is_active, originalData.is_active);
    appendIfChanged("description", description, originalData.description);

    if (values.sale_price) {
      appendIfChanged("sale_price", values.sale_price, originalData.sale_price);
    }
    if (values.start_sale) {
      appendIfChanged(
        "start_sale",
        toPostgresTimestamp(values.start_sale),
        originalData.start_sale
      );
    }
    if (values.end_sale) {
      appendIfChanged(
        "end_sale",
        toPostgresTimestamp(values.end_sale),
        originalData.end_sale
      );
    }

    // Kiểm tra thay đổi tags và categories (giữ nguyên)
    if (!isEqual(values.tag_ids, originalData.tag_ids)) {
      values.tag_ids?.forEach((id) => formData.append("tag_ids", String(id)));
      hasChanges = true;
    }

    if (!isEqual(values.category_ids, originalData.category_ids)) {
      values.category_ids.forEach((id) =>
        formData.append("category_ids", String(id))
      );
      hasChanges = true;
    }

    // Xử lý variants và variant bị xóa (giữ nguyên logic cũ)
    if (deleteVariantIds.length > 0) {
      deleteVariantIds.forEach((id) => {
        formData.append("delete_variant_ids", id);
      });
      hasChanges = true;
    }

    // Xử lý variants (giữ nguyên logic cũ)
    const normalize = (val: any) => {
      if (val == null) return "";
      return String(val).trim();
    };

    const isVariantChanged = (newVariant: any, oldVariant: any) => {
      const newColorId = colorMap[newVariant.color] || newVariant.color_id;
      const newSizeId = sizeMap[newVariant.size] || newVariant.size_id;
      const oldColorId = oldVariant.color_id || colorMap[oldVariant.color];
      const oldSizeId = oldVariant.size_id || sizeMap[oldVariant.size];

      return (
        normalize(newVariant.sku) !== normalize(oldVariant.sku) ||
        Number(newVariant.quantity) !== Number(oldVariant.quantity) ||
        String(newColorId) !== String(oldColorId) ||
        String(newSizeId) !== String(oldSizeId)
      );
    };

    let newIndex = 0;
    let updateIndex = 0;

    values.variants?.forEach((variant) => {
      const formVariant = {
        sku: normalize(variant.sku),
        quantity: Number(variant.quantity),
        color_id: colorMap[variant.color] || variant.color_id,
        size_id: sizeMap[variant.size] || variant.size_id,
      };

      if (variant.id) {
        const originalVariant = originalData.variants.find(
          (v: any) => v.id === variant.id
        );

        if (originalVariant) {
          const changed = isVariantChanged(variant, originalVariant);

          if (changed) {
            formData.append(`update_variants[${updateIndex}][id]`, variant.id);
            formData.append(
              `update_variants[${updateIndex}][sku]`,
              formVariant.sku
            );
            formData.append(
              `update_variants[${updateIndex}][quantity]`,
              String(formVariant.quantity)
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
            hasChanges = true;
          }
        }
      } else {
        formData.append(`new_variants[${newIndex}][sku]`, formVariant.sku);
        formData.append(
          `new_variants[${newIndex}][quantity]`,
          String(formVariant.quantity)
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
        hasChanges = true;
      }
    });

    // Xử lý ảnh bị xóa
    if (deletedImageIds.length > 0) {
      deletedImageIds.forEach((id) => {
        formData.append("delete_image_ids", id);
      });
      hasChanges = true;
    }

    // Xử lý ảnh cũ được cập nhật
    let imageUpdateIndex = 0;
    Object.entries(colorImages).forEach(([colorName, fileList]) => {
      const originalFiles = originalData.colorImages[colorName] || [];

      fileList.forEach((file, idx) => {
        if (file.isOld && file.uid) {
          const originalFile = originalFiles.find(
            (f: any) => f.uid === file.uid
          );
          const originalThumb = !!originalFile?.isThumbnail;
          const currentThumb = !!file.isThumbnail;
          const originalSort = originalFile?.sortOrder;
          const currentSort = file.sortOrder ?? idx + 1;

          if (originalThumb !== currentThumb || originalSort !== currentSort) {
            formData.append(`update_images[${imageUpdateIndex}][id]`, file.uid);
            formData.append(
              `update_images[${imageUpdateIndex}][is_thumbnail]`,
              String(currentThumb)
            );
            formData.append(
              `update_images[${imageUpdateIndex}][sort_order]`,
              String(currentSort)
            );
            imageUpdateIndex++;
            hasChanges = true;
          }
        }
      });
    });

    // Kiểm tra và xử lý ảnh mới
    let newImageIndex = 0;
    const usedFiles = new Set();
    let hasNewImagesToUpload = false;

    for (const [colorName, fileList] of Object.entries(colorImages)) {
      const color_id = colorMap[colorName];
      const originalFiles = originalData.colorImages[colorName] || [];

      fileList.forEach((file, idx) => {
        const fileKey = file.uid || file.name;
        if (usedFiles.has(fileKey)) return;

        const isNewImage =
          !file.isOld &&
          !originalFiles.some(
            (f: any) => f.name === file.name && f.size === file.size
          );

        if (isNewImage && file.originFileObj) {
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
            String(!!file.isThumbnail)
          );
          formData.append(
            `new_images[${newImageIndex}][sort_order]`,
            String(idx + 1)
          );
          usedFiles.add(fileKey);
          newImageIndex++;
          hasChanges = true;
          hasNewImagesToUpload = true;
        }
      });
    }

    if (!hasChanges) {
      messageApiRef.info("Không có thay đổi nào để lưu!");
      return;
    }

    try {
      setIsLoading(true);

      // Nếu có ảnh mới, kết nối SSE trước khi gọi API
      if (hasNewImagesToUpload) {
        // Kết nối SSE và set trạng thái
        connectSSE(productId, "product");
      }

      const res = await updateProduct(productId, formData);
      messageApiRef.success(res.data.message);

      setDeletedImageIds([]);
      setDeleteVariantIds([]);
      setProduct(res.data.data.product);

      if (!hasNewImagesToUpload) {
        setImageList(res.data.data.product.images || []);
        await fetchImageByProductId();
        setIsLoading(false);
      }

      setDataInitialized(false);
    } catch (error: any) {
      messageApiRef.error(error);
      if (hasNewImagesToUpload) {
        useEventStore.getState().reset();
      }
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const res = await deleteProduct(productId);
      messageApiRef.success(res.data.message);
      router.push("/products/deleted");
    } catch (error: any) {
      messageApiRef.error(error);
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
    return (
      <div className="flex justify-center p-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <Flex align="center" justify="space-between" className="mb-6">
        <h1 className="text-2xl font-bold text-black">Chi tiết sản phẩm</h1>

        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
        >
          Quay lại
        </Button>
      </Flex>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ is_sale: false, is_active: true, category_ids: [] }}
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
                  <div className="text-xs ml-3 inline-block text-gray-600">
                    ({c.slug})
                  </div>
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

          <Form.Item label="Mở bán" name="is_active" valuePropName="checked">
            <Switch onChange={(val) => setIsActive(val)} />
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
        >
          <Editor
            apiKey={apiKey}
            value={description}
            onEditorChange={(content) => {
              setDescription(content);
              form.setFieldsValue({ description: content });
            }}
            init={{
              height: 400,
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

        <Form.Item label="Thuộc tính sản phẩm">
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <>
                <div className="space-y-6">
                  {fields.map(({ key, name, ...restField }) => {
                    return (
                      <div
                        key={key}
                        className="relative space-y-4 border p-4 rounded-md"
                      >
                        <MinusCircleOutlined
                          onClick={() => handleRemoveVariant(name, remove)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl cursor-pointer"
                        />

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                          <Form.Item
                            {...restField}
                            label="SKU"
                            name={[name, "sku"]}
                            rules={[{ required: true, message: "Nhập SKU" }]}
                            className="m-0"
                          >
                            <Input
                              size="large"
                              onChange={(e) => {
                                // Force re-render với unique value
                                const value = e.target.value;
                              }}
                            />
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
                              onChange={(value) => {
                                setTimeout(() => {
                                  form.validateFields([[name, "size"]]);
                                }, 0);
                              }}
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
                              onChange={(value) => {
                                const currentVariant = form.getFieldValue([
                                  "variants",
                                  name,
                                ]);
                                const oldColor =
                                  variantColorHistory[name] ||
                                  currentVariant?.color;

                                setVariantColorHistory((prev) => ({
                                  ...prev,
                                  [name]: value,
                                }));

                                handleColorChangeForVariant(
                                  oldColor,
                                  value,
                                  name
                                );
                                setTimeout(() => {
                                  form.validateFields([[name, "color"]]);
                                }, 0);
                              }}
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
                            <Input
                              type="number"
                              size="large"
                              onChange={(e) => {
                                const value = e.target.value;

                                const currentVariants =
                                  form.getFieldValue("variants") || [];
                                const updatedVariants = [...currentVariants];
                                if (updatedVariants[name]) {
                                  updatedVariants[name] = {
                                    ...updatedVariants[name],
                                    quantity: Number(value),
                                  };
                                }
                              }}
                            />
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
                      onSetThumbnail={handleSetThumbnail}
                      onImageRemove={handleImageRemove}
                      disabled={isCreating || isUploading}
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

          <Flex gap={20}>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-500 flex items-center justify-center"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý" : "Cập nhật"}
              </Button>
            </Form.Item>
            <Form.Item>
              <Popconfirm
                title="Bạn có chắc muốn xóa sản phẩm này?"
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={handleDelete}
                disabled={isLoading}
                okButtonProps={{
                  loading: isLoading,
                }}
              >
                <Button
                  type="primary"
                  icon={<DeleteOutlined />}
                  className="bg-red-500 flex items-center justify-center"
                  loading={isLoading}
                  disabled={isLoading}
                  danger
                >
                  {isLoading ? "Đang xử lý" : "Xóa"}
                </Button>
              </Popconfirm>
            </Form.Item>
          </Flex>
        </div>
      </Form>
    </div>
  );
}
