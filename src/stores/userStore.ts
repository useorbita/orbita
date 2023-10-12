import { create } from "zustand";
import { pb } from "../api/pocketbase";

interface UserStore {
  isLoading: boolean;
  isAuthenticated: boolean;

  login: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<void>;

  logout: () => void;
}

export const useUserStore = create<UserStore>()((set) => ({
  isLoading: false,
  isAuthenticated: pb.authStore.isValid,
  login: async ({ email, password }) => {
    set({ isLoading: true });

    const response = await pb
      .collection("users")
      .authWithPassword(email, password);

    if (response.token) set({ isAuthenticated: true });
    set({ isLoading: false });
  },
  logout: () => {
    pb.authStore.clear();
    set({ isAuthenticated: false });
  },
}));
