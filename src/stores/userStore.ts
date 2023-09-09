import { create } from "zustand";
import { pb } from "../api/pocketbase";

interface UserStore {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: ({ email, password }: { email: string; password: string }) => void;
  logout: () => void;
}

console.log(pb.authStore.model);

export const useUserStore = create<UserStore>()((set) => ({
  isLoading: false,
  isAuthenticated: !!pb.authStore.model,
  login: async ({ email, password }) => {
    set({ isLoading: true });

    const response = await pb
      .collection("users")
      .authWithPassword(email, password);

    if (response.token) set({ isAuthenticated: true });
    set({ isLoading: false });
  },
  logout: async () => {
    pb.authStore.clear();
    set({ isAuthenticated: false });
  },
}));
