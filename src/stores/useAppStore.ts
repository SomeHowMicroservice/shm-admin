import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface IAuth {
  email: string;
  registration_token: string;
}

const initialState: IAuth = {
  email: "",
  registration_token: "",
};

interface IAuthAction {
  setNewToken: (registratiom_token: Omit<IAuth, "email">) => void;
  setNewEmail: (email: Omit<IAuth, "registration_token">) => void;
  logoutUser: () => void;
}

export const useAuthStore = create<IAuth & IAuthAction>()(
  immer((set) => ({
    ...initialState,
    setNewToken: ({ registration_token }) => {
      set((state) => {
        state.registration_token = registration_token;
      });
    },
    setNewEmail: ({ email }) => {
      set((state) => {
        state.email = email;
      });
    },
    logoutUser: () => set(() => initialState),
  }))
);
