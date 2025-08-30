import axiosRequest from "@/config/axios";
import axios from "axios";
import { useAppStore } from "@/stores/useAuthStore";

export const login = (data: { username: string; password: string }) => {
  return axiosRequest.post("/admin/sign-in", data);
};

export const register = (data: {
  username: string;
  email: string;
  password: string;
}) => {
  return axiosRequest.post("auth/sign-up", data);
};

export const getMe = async () => {
  try {
    return await axiosRequest.get("/auth/me");
  } catch (error) {
    console.log(error);
  }
};

export const verifyOtp = async (registration_token: string, otp: string) => {
  try {
    const res = await axiosRequest.post("/auth/sign-up/verify", {
      registration_token,
      otp,
    });
    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const setTokenServer = async (data: object) => {
  try {
    const res = await axios.post("/api/auth", { data });
    return res;
  } catch (error) {
    console.log("errors", error);
  }
};

export const getRefreshToken = () => {
  return axiosRequest.get("/auth/refresh");
};

export const deleteTokenServer = async () => {
  try {
    const res = await axios.delete("/api/auth");
    return res;
  } catch (error) {
    console.log("errors", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    const res = await axiosRequest.post("/auth/sign-out");
    useAppStore.getState().clearProfile();
    deleteTokenServer();
    return res;
  } catch (error) {
    console.log("errors", error);
    throw error;
  }
};

export const forgotPassword = (email: string) => {
  return axiosRequest.post("/auth/forgot-password", { email });
};

export const resetPassword = (data: {
  newPassword: string;
  registration_token: string;
}) => {
  return axiosRequest.post("/auth/forgot-password/reset-password", data);
};

export const logout = () => {
  return axiosRequest.post("/auth/sign-out");
};
