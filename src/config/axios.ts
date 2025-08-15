// api/axiosClient.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import qs from "qs";
import { getCookie } from "@/utils/cookies";
import { ACCESS_TOKEN } from "@/constants/token";
import { setTokenServer } from "@/api/auth";
import { useAppStore } from "@/stores/useAuthStore";

type IRequestCb = (token: string) => void;

let isRefreshing = false;
let refreshSubscribers: IRequestCb[] = [];

const subscribeTokenRefresh = (cb: IRequestCb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

// Axios cho request thường
const axiosRequest: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true, // cookie HttpOnly sẽ tự gửi
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: "indices", allowDots: true }),
});

// Axios riêng cho refresh token (không interceptor để tránh loop)
const refreshAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // cookie HttpOnly tự gửi khi refresh
});

// Interceptor request: gắn access token từ cookie vào header
axiosRequest.interceptors.request.use(
  (config) => {
    const token = getCookie(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response: handle 401 và refresh token
axiosRequest.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401) {
      if (originalRequest._retry) {
        useAppStore.getState().clearProfile();
        return Promise.reject("Unauthorized.");
      }

      originalRequest._retry = true;

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          resolve(axiosRequest(originalRequest));
        });

        if (!isRefreshing) {
          isRefreshing = true;
          refreshAxios
            .post("/auth/refresh")
            .then(({ data }) => {
              setTokenServer(data);
              onRefreshed(data.accessToken);
            })
            .catch((err) => {
              useAppStore.getState().clearProfile();
              reject("Session expired. Please login again.");
            })
            .finally(() => {
              isRefreshing = false;
            });
        }
      });
    }

    if (error.code === AxiosError.ERR_NETWORK) {
      return Promise.reject("Network error. Please check your connection.");
    }

    return Promise.reject(
      error.response?.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
        ? (error.response.data as { message: string }).message
        : "Unexpected error."
    );
  }
);

export default axiosRequest;
