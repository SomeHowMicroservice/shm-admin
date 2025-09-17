import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

interface Profile {
  id: string;
  gender: string;
  first_name: string;
  last_name: string;
  dob: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  profile: Profile;
}

interface AppState {
  profile: Profile;
  user: User;
  setProfile: (profile: Profile) => void;
  clearProfile: () => void;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const initialProfileState: Profile = {
  id: "",
  gender: "",
  first_name: "",
  last_name: "",
  dob: "",
};

const initialUserState: User = {
  id: "",
  username: "",
  email: "",
  created_at: "",
  profile: initialProfileState,
};

export const useAuthStore = create<AppState>()(
  persist(
    immer((set) => ({
      user: initialUserState,
      profile: initialProfileState,
      setProfile: (profile: Profile) => {
        set((state) => {
          state.profile = profile;
        });
      },
      clearProfile: () => {
        set((state) => {
          state.profile = initialProfileState;
        });
      },
      setUser: (user: User) => {
        set((state) => {
          state.user = user;
        });
      },
      clearUser: () => {
        set((state) => {
          state.user = initialUserState;
        });
      },
    })),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);
