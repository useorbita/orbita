import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { pb } from "./pocketbase";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [user, setUser] = useState(pb.authStore.record);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid);
      setUser(pb.authStore.record);
    });
    return unsubscribe;
  }, []);

  return { isAuthenticated, user };
};

export const useSignIn = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      pb.collection("users").authWithPassword(email, password),
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }) => {
      await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        name,
      });
      return pb.collection("users").authWithPassword(email, password);
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      pb.authStore.clear();
    },
  });
};
