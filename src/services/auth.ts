import { logOut, login } from "@/api/auth";
import { useAppStore } from "@/stores/useAuthStore";
import { useAuthStore } from "@/stores/useAppStore";

export const logOutUser = async () => {
  try {
    const res = await logOut();
    useAppStore.getState().clearProfile();
    useAuthStore.getState().logoutUser();
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
    useAppStore.getState().setProfile(res.data.data.user.profile);
    return res;
  } catch (error) {
    throw error;
  }
};
