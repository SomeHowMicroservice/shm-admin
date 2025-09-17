import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { getCookie } from "@/utils/cookies";
import { ACCESS_TOKEN } from "@/constants/token";
import { setTokenServer } from "@/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export const getAccessToken = () => {
  return Cookies.get("access_token");
};

export const getRefreshToken = () => {
  return Cookies.get("refresh_token");
};

export const setAccessToken = (token: string) => {
  Cookies.set("access_token", token);
};

export const setRefreshToken = (token: string) => {
  Cookies.set("refresh_token", token);
};

export const removeTokens = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
};

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

interface JwtPayload {
  exp: number; // seconds since epoch
}

const REFRESH_EARLY_MS = 10_000; // refresh trước khi hết hạn 10s (có thể chỉnh 30_000)

export function scheduleTokenRefresh() {
  const token = getCookie(ACCESS_TOKEN);
  if (!token) return;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const expiresAtMs = decoded.exp * 1000;
    const now = Date.now();
    const delay = Math.max(expiresAtMs - now - REFRESH_EARLY_MS, 0);

    // Clear timer cũ nếu có
    if (refreshTimer) clearTimeout(refreshTimer);

    // Nếu đã hết hạn (hoặc sắp hết hạn) thì refresh ngay
    if (delay === 0) {
      void refreshToken();
    } else {
      refreshTimer = setTimeout(() => void refreshToken(), delay);
    }
  } catch (e) {
    // Token hỏng → thử refresh ngay
    if (refreshTimer) clearTimeout(refreshTimer);
    void refreshToken();
  }
}

export function clearRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

async function refreshToken() {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {},
      { withCredentials: true } // gửi HttpOnly refresh cookie
    );

    // Hàm của bạn: lưu access token mới vào cookie/local storage
    setTokenServer(data);

    // Đặt lại timer cho token mới
    scheduleTokenRefresh();
  } catch (err) {
    // Refresh fail → đăng xuất local
    clearRefreshTimer();
    useAuthStore.getState().clearProfile();
    // tuỳ bạn: có thể điều hướng sang /login ở đây
    // router.push('/login')
  }
}
