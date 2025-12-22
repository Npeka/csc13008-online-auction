import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    address?: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  setUser: (user: User | null) => void;
}

// Mock users for development
const mockUsers: Record<string, User & { password: string }> = {
  "admin@morphee.com": {
    id: "user-1",
    fullName: "Morphee Admin",
    email: "admin@morphee.com",
    password: "admin123",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    address: "123 Reptile Way, Miami, FL 33101",
    rating: { positive: 150, negative: 2, total: 152 },
    createdAt: "2024-01-01T00:00:00Z",
  },
  "breeder@morphee.com": {
    id: "user-2",
    fullName: "John Reptiles",
    email: "breeder@morphee.com",
    password: "breeder123",
    role: "seller",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=seller",
    address: "456 Python Lane, Tampa, FL 33602",
    rating: { positive: 89, negative: 3, total: 92 },
    createdAt: "2023-03-15T00:00:00Z",
  },
  "buyer@morphee.com": {
    id: "user-3",
    fullName: "Sarah Chen",
    email: "buyer@morphee.com",
    password: "buyer123",
    role: "bidder",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bidder",
    address: "789 Gecko Street, Orlando, FL 32801",
    rating: { positive: 25, negative: 1, total: 26 },
    createdAt: "2024-01-10T00:00:00Z",
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser = mockUsers[email];
        if (mockUser && mockUser.password === password) {
          const { password: _, ...userWithoutPassword } = mockUser;
          set({
            user: userWithoutPassword,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        }

        set({ isLoading: false });
        return false;
      },

      register: async (data) => {
        set({ isLoading: true });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Create new user
        const newUser: User = {
          id: `user-${Date.now()}`,
          fullName: data.fullName,
          email: data.email,
          role: "bidder",
          address: data.address,
          rating: { positive: 0, total: 0 },
          createdAt: new Date().toISOString(),
        };

        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
        });

        return true;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
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
    }),
    {
      name: "morphee-auth-storage",
    },
  ),
);
