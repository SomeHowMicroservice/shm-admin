import { logOut, login } from "@/api/auth";
import { useAppStore } from "@/stores/useAppStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { clearRefreshTimer, scheduleTokenRefresh } from "@/utils/token";

export const logOutUser = async () => {
  try {
    const res = await logOut();
    useAuthStore.getState().clearProfile();
    useAuthStore.getState().clearUser();
    clearRefreshTimer();
    return res;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (data: {
  username: string;
  password: string;
}) => {
  try {
    const res = await login(data);
    useAuthStore.getState().setProfile(res.data.data.user.profile);
    useAuthStore.getState().setUser(res.data.data.user);
    scheduleTokenRefresh();
    return res;
  } catch (error) {
    throw error;
  }
};
