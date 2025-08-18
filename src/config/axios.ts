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
import { scheduleTokenRefresh, clearRefreshTimer } from "@/utils/token";

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

// Axios chính cho request app
const axiosRequest: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: "indices", allowDots: true }),
});

// Axios riêng cho refresh để tránh interceptor loop
const refreshAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// GẮN ACCESS TOKEN VÀO HEADER
axiosRequest.interceptors.request.use(
  (config) => {
    const token = getCookie(ACCESS_TOKEN);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// XỬ LÝ RESPONSE: 401 → REFRESH + QUEUE
axiosRequest.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Nếu lỗi là 401 → refresh
    if (error.response?.status === 401) {
      if (originalRequest._retry) {
        useAppStore.getState().clearProfile();
        clearRefreshTimer();
        return Promise.reject("Unauthorized.");
      }
      originalRequest._retry = true;

      // Hàng đợi các request trong lúc refresh diễn ra
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${newToken}` };
          }
          resolve(axiosRequest(originalRequest));
        });

        if (!isRefreshing) {
          isRefreshing = true;
          refreshAxios
            .post("/auth/refresh")
            .then(({ data }) => {
              // Cập nhật token mới
              setTokenServer(data);

              // Đặt lại lịch auto-refresh theo token mới
              scheduleTokenRefresh();

              // Đánh thức các request đang chờ
              onRefreshed(data.accessToken);
            })
            .catch(() => {
              useAppStore.getState().clearProfile();
              clearRefreshTimer();
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

    // Chuẩn hoá message
    return Promise.reject(
      error.response?.data &&
        typeof error.response.data === "object" &&
        "message" in (error.response.data as object)
        ? (error.response?.data as { message: string }).message
        : "Unexpected error."
    );
  }
);

export default axiosRequest;

/**
 * (TUỲ CHỌN) Hàm bootstrap khi app khởi chạy ở client:
 * - Nếu đã có access token trong cookie → đặt lịch auto-refresh.
 * - Gọi nó một lần ở layout client hoặc AppProvider.
 */
export function bootstrapAuthTimer() {
  const token = getCookie(ACCESS_TOKEN);
  if (token) {
    scheduleTokenRefresh();
  } else {
    clearRefreshTimer();
  }
}
