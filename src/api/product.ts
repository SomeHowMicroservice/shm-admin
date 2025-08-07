/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosRequest from "@/config/axios";
import { Size, Tags } from "@/types/product";

export const getAllProducts = async () => {
  return axiosRequest.get("/admin/products");
};

export const getCategories = async () => {
  return axiosRequest.get("/admin/categories");
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

const productAPI = {
  createCategory,
  getCategories,
  getCategoryById,
  getColors,
  createColor,
  getSizes,
  createSize,
  getProductColors,
  getProductSizes,
  getProductTags,
};

export default productAPI;
