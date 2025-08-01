import axiosRequest from "@/config/axios";
import { useAppStore } from "@/stores/useAuthStore";

export const getCategories = async () => {
  return axiosRequest.get("/admin/categories");
};

export const createCategory = (data: { name: string; slug?: string }) => {
  return axiosRequest.post("/admin/categories", data);
};

const productAPI = {
  createCategory,
};

export default productAPI;
