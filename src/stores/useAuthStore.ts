import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface Profile {
  id: string;
  gender: string;
  first_name: string;
  last_name: string;
  dob: string;
}

interface AppState {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  clearProfile: () => void;
}

const initialProfileState: Profile = {
  id: "",
  gender: "",
  first_name: "",
  last_name: "",
  dob: "",
};

const initialState: AppState = {
  profile: initialProfileState,
  setProfile: () => {},
  clearProfile: () => {},
};

export const useAppStore = create<AppState>()(
  immer((set) => ({
    ...initialState,
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
  }))
);
