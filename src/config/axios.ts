import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import qs from "qs";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/token";
import { useAppStore } from "@/stores/useAuthStore";
import { getRefreshToken, setTokenServer } from "@/api/auth";
import { getCookie } from "@/utils/cookies";

type IRequestCb = (token: string) => void;

let isRefreshing = false;
let refreshSubscribers: IRequestCb[] = [];

// Helper: subscribe waiting requests to retry
const subscribeTokenRefresh = (cb: IRequestCb) => {
  refreshSubscribers.push(cb);
};

// Helper: call all waiting subscribers after token refreshed
const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = []; // clear after done
};

// Create Axios instance
const axiosRequest: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
  paramsSerializer: (params) =>
    qs.stringify(params, {
      arrayFormat: "indices",
      allowDots: true,
    }),
});

// Request interceptor
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

// Response interceptor
axiosRequest.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    const oldRefreshToken = getCookie(REFRESH_TOKEN);

    if (error.response?.status === 401) {
      if (!oldRefreshToken) {
        useAppStore.getState().clearProfile();
        return Promise.reject("Unauthenticated: Please login again.");
      }

      if (originalRequest._retry) {
        // prevent infinite loop
        useAppStore.getState().clearProfile();
        return Promise.reject("Unauthorized: Token refresh failed.");
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await getRefreshToken();
          setTokenServer(data);
          onRefreshed(data.accessToken);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          useAppStore.getState().clearProfile();
          return Promise.reject("Session expired. Please login again.");
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          originalRequest._retry = true;
          resolve(axiosRequest(originalRequest));
        });
      });
    }

    // Handle network errors globally
    if (error.code === AxiosError.ERR_NETWORK) {
      return Promise.reject("Network error. Please check your connection.");
    }

    // Default fallback
    const errorMessage =
      error.response?.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data
        ? (error.response.data as { message: string }).message
        : "An unexpected error occurred.";
    return Promise.reject(errorMessage);
  }
);

export default axiosRequest;
