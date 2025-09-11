/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosRequest from "@/config/axios";
import { GetAllProductsParams } from "@/types/pagination";
import { Size, Tags } from "@/types/product";

export const getAllProducts = (params?: GetAllProductsParams) => {
  return axiosRequest.get("/admin/products", { params });
};

export const getCategories = async () => {
  return axiosRequest.get("/admin/categories");
};

export const getCategoryTree = async () => {
  return axiosRequest.get("/categories/tree");
};

export const createCategory = (data: { name: string; slug?: string }) => {
  return axiosRequest.post("/admin/categories", data);
};

export const getCategoryById = async (id: string) => {
  return axiosRequest.get(`/admin/categories/${id}`);
};

export const createSize = async (size: Size) => {
  return axiosRequest.post("/admin/sizes", size);
};

export const getSizes = async () => {
  return axiosRequest.get("/admin/sizes");
};

export const createColor = async (size: Size) => {
  return axiosRequest.post("/admin/colors", size);
};

export const getColors = async () => {
  return axiosRequest.get("/admin/colors");
};

export const createTag = async (tag: Tags) => {
  return axiosRequest.post("/admin/tags", tag);
};

export const getTags = async () => {
  return axiosRequest.get("/admin/tags");
};

export const getProductColors = async () => {
  return axiosRequest.get("/colors");
};

export const getProductSizes = async () => {
  return axiosRequest.get("/sizes");
};

export const getProductTags = async () => {
  return axiosRequest.get("/tags");
};

export const createProduct = async (data: any) => {
  return axiosRequest.post("/admin/products", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 10000,
  });
};

export const getProductById = async (id: string) => {
  return axiosRequest.get(`/admin/products/${id}`);
};

export const updateProduct = async (id: string, data: any) => {
  return axiosRequest.patch(`/admin/products/${id}`, data);
};

export const getTagsNoChild = () => {
  return axiosRequest.get("/tags");
};

export const getColorsNoChild = () => {
  return axiosRequest.get("/colors");
};

export const getSizesNoChild = () => {
  return axiosRequest.get("/sizes");
};

export const getCategoriesNoChild = () => {
  return axiosRequest.get("/categories/no-child");
};

export const deleteCategory = (id: string) => {
  return axiosRequest.delete(`/admin/categories/${id}/permanent`);
};

export const deleteCategories = (ids: string[]) => {
  return axiosRequest.delete("/admin/categories/permanent", {
    data: { ids },
  });
};

export const updateSize = (id: string, data: { name: string }) => {
  return axiosRequest.put(`/admin/sizes/${id}`, data);
};

export const updateTag = (id: string, data: { name: string }) => {
  return axiosRequest.put(`/admin/tags/${id}`, data);
};

export const updateColor = (id: string, data: { name: string }) => {
  return axiosRequest.put(`/admin/colors/${id}`, data);
};

export const updateCategory = (
  id: string,
  data: { name: string; slug?: string; parent_ids?: string[] }
) => {
  return axiosRequest.put(`/admin/categories/${id}`, data);
};

export const deleteProductPermanent = (id: string) => {
  return axiosRequest.delete(`/admin/products/${id}/permanent`);
};

export const deleteProductsPermanent = (ids: string[]) => {
  return axiosRequest.delete("/admin/products/permanent", {
    data: { ids },
  });
};

export const deleteProduct = (id: string) => {
  return axiosRequest.delete(`/admin/products/${id}`);
};

export const deleteProducts = (ids: string[]) => {
  return axiosRequest.delete("/admin/products", {
    data: { ids },
  });
};

export const deleteColor = (id: string) => {
  return axiosRequest.delete(`/admin/colors/${id}`);
};

export const deleteColors = (ids: string[]) => {
  return axiosRequest.delete("/admin/colors", {
    data: { ids },
  });
};

export const deleteColorPermanent = (id: string) => {
  return axiosRequest.delete(`/admin/colors/${id}/permanent`);
};

export const deleteColorsPermanent = (ids: string[]) => {
  return axiosRequest.delete("/admin/colors/permanent", {
    data: { ids },
  });
};

export const deleteSize = (id: string) => {
  return axiosRequest.delete(`/admin/sizes/${id}`);
};

export const deleteSizes = (ids: string[]) => {
  return axiosRequest.delete("/admin/sizes", {
    data: { ids },
  });
};

export const deleteSizePermanent = (id: string) => {
  return axiosRequest.delete(`/admin/sizes/${id}/permanent`);
};

export const deleteSizesPermanent = (ids: string[]) => {
  return axiosRequest.delete("/admin/sizes/permanent", {
    data: { ids },
  });
};

export const deleteTag = (id: string) => {
  return axiosRequest.delete(`/admin/tags/${id}`);
};

export const deleteTags = (ids: string[]) => {
  return axiosRequest.delete("/admin/tags", {
    data: { ids },
  });
};

export const deleteTagPermanent = (id: string) => {
  return axiosRequest.delete(`/admin/tags/${id}/permanent`);
};

export const deleteTagsPermanent = (ids: string[]) => {
  return axiosRequest.delete("/admin/tags/permanent", {
    data: { ids },
  });
};

export const getDeletedProduct = (params?: GetAllProductsParams) => {
  return axiosRequest.get("/admin/products/deleted", { params });
};

export const getDeletedProductDetail = (id: string) => {
  return axiosRequest.get(`/admin/products/${id}/deleted`);
};

export const getDeletedSizes = () => {
  return axiosRequest.get("/admin/sizes/deleted");
};

export const getDeletedSizesDetail = (id: string) => {
  return axiosRequest.get(`/admin/sizes/${id}/deleted`);
};

export const getDeletedColors = () => {
  return axiosRequest.get("/admin/colors/deleted");
};

export const getDeletedColorsDetail = (id: string) => {
  return axiosRequest.get(`/admin/colors/${id}/deleted`);
};

export const getDeletedTags = () => {
  return axiosRequest.get("/admin/tags/deleted");
};

export const getDeletedTagsDetail = (id: string) => {
  return axiosRequest.get(`/admin/tags/${id}/deleted`);
};

export const restoreSize = (id: string) => {
  return axiosRequest.patch(`/admin/sizes/${id}/restore`);
};

export const restoreSizes = (ids: string[]) => {
  return axiosRequest.put("/admin/sizes/restore", { ids });
};

export const restoreColor = (id: string) => {
  return axiosRequest.patch(`/admin/colors/${id}/restore`);
};

export const restoreColors = (ids: string[]) => {
  return axiosRequest.put("/admin/colors/restore", { ids });
};

export const restoreTag = (id: string) => {
  return axiosRequest.patch(`/admin/tags/${id}/restore`);
};

export const restoreTags = (ids: string[]) => {
  return axiosRequest.put("/admin/tags/restore", { ids });
};

export const restoreProduct = (id: string) => {
  return axiosRequest.patch(`/admin/products/${id}/restore`);
};

export const restoreProducts = (ids: string[]) => {
  return axiosRequest.put("/admin/products/restore", { ids });
};
