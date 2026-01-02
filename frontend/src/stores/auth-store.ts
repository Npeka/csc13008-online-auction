import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, usersApi } from "@/lib";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingVerification: { email: string; name: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    address?: string;
    phone?: string;
    dateOfBirth?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  verifyEmail: (email: string, otpCode: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  googleLogin: (firebaseToken: string) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => void;
  setUser: (user: User | null) => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      pendingVerification: null,

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register({
            email: data.email,
            password: data.password,
            name: data.fullName,
            address: data.address,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth,
          });

          set({
            isLoading: false,
            pendingVerification: {
              email: data.email,
              name: data.fullName,
            },
          });

          return {
            success: true,
            message: response.message,
          };
        } catch (error: any) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || "Registration failed",
          };
        }
      },

      verifyEmail: async (email, otpCode) => {
        set({ isLoading: true });
        try {
          const response = await authApi.verifyEmail(email, otpCode);

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            pendingVerification: null,
          });

          return true;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      resendOtp: async (email) => {
        set({ isLoading: true });
        try {
          const response = await authApi.resendOtp(email);
          set({ isLoading: false });
          return {
            success: true,
            message: response.message,
          };
        } catch (error: any) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || "Failed to resend OTP",
          };
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const response = await authApi.login({ email, password });

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error: any) {
          set({ isLoading: false });

          // Check if email not verified
          if (error.response?.data?.message?.includes("verify")) {
            set({
              pendingVerification: { email, name: "" },
            });
          }

          return false;
        }
      },

      logout: async () => {
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          try {
            await authApi.logout(refreshToken);
          } catch (error) {
            // Ignore logout errors
          }
        }

        set({
          user: null,
          isAuthenticated: false,
          pendingVerification: null,
        });
      },

      googleLogin: async (firebaseToken: string) => {
        set({ isLoading: true });

        try {
          const response = await authApi.googleLogin(firebaseToken);

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            pendingVerification: null,
          });

          return true;
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(
            error.response?.data?.error?.message || "Google login failed",
          );
        }
      },

      updateProfile: (data) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...data },
          });
        }
      },

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      fetchProfile: async () => {
        try {
          const user = await usersApi.getProfile();
          set({
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: "morphee-auth-storage",
    },
  ),
);
