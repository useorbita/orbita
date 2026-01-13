import { create } from "zustand";
import { pb } from "../api/pocketbase";

interface UserStore {
  isLoading: boolean;
  isAuthenticated: boolean;

  signin: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<void>;

  signup: ({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;

  logout: () => void;
}

export const useUserStore = create<UserStore>()((set) => ({
  isLoading: false,
  isAuthenticated: pb.authStore.isValid,
  signin: async ({ email, password }) => {
    set({ isLoading: true });

    const response = await pb
      .collection("users")
      .authWithPassword(email, password);

    if (response.token) set({ isAuthenticated: true });
    set({ isLoading: false });
  },
  signup: async ({ email, password, name }) => {
    set({ isLoading: true });

    await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      name,
    });

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
