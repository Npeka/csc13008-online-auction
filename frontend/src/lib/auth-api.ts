import type { User } from "@/types";
import { apiClient } from "./api-client";

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  address?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterResponse {
  user: Partial<User>;
  message: string;
  otpCode?: string; // Only in development
}

/**
 * Transform backend user DTO to frontend User format
 */
const transformUser = (backendUser: any): User => {
  return {
    id: backendUser.id,
    fullName: backendUser.name,
    email: backendUser.email,
    avatar: backendUser.avatar,
    role: backendUser.role,
    address: backendUser.address,
    dateOfBirth: backendUser.dateOfBirth,
    createdAt: backendUser.createdAt,
    rating: {
      positive: Math.max(0, backendUser.rating || 0),
      negative: Math.max(0, -Math.min(0, backendUser.rating || 0)),
      total: backendUser.ratingCount || 0,
    },
    isVerified: backendUser.emailVerified,
  };
};

export const authApi = {
  // Register
  register: async (
    data: RegisterData,
  ): Promise<{ message: string; otpCode?: string }> => {
    return await apiClient.post("/auth/register", data);
  },

  // Verify email with OTP
  verifyEmail: async (
    email: string,
    otpCode: string,
  ): Promise<AuthResponse> => {
    const data = await apiClient.post<any>("/auth/verify-email", {
      email,
      otpCode,
    });

    // Store tokens
    if (data.tokens) {
      localStorage.setItem("accessToken", data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);
    }

    return {
      ...data,
      user: transformUser(data.user),
    };
  },

  // Resend OTP
  resendOtp: async (
    email: string,
  ): Promise<{ message: string; otpCode?: string }> => {
    return await apiClient.post("/auth/resend-otp", { email });
  },

  // Login
  login: async (data: LoginData): Promise<AuthResponse> => {
    const responseData = await apiClient.post<any>("/auth/login", data);

    // Store tokens
    if (responseData.tokens) {
      localStorage.setItem("accessToken", responseData.tokens.accessToken);
      localStorage.setItem("refreshToken", responseData.tokens.refreshToken);
    }

    return {
      ...responseData,
      user: transformUser(responseData.user),
    };
  },

  // Logout
  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post("/auth/logout", { refreshToken });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  // Change password
  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> => {
    return await apiClient.patch("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  // Forgot password
  forgotPassword: async (
    email: string,
  ): Promise<{ message: string; otpCode?: string }> => {
    return await apiClient.post("/auth/forgot-password", { email });
  },

  // Verify reset OTP
  verifyResetOTP: async (
    email: string,
    otpCode: string,
  ): Promise<{ message: string; resetToken: string }> => {
    return await apiClient.post("/auth/verify-reset-otp", {
      email,
      otpCode,
    });
  },

  // Reset password
  resetPassword: async (
    email: string,
    resetToken: string,
    newPassword: string,
  ): Promise<{ message: string }> => {
    return await apiClient.post("/auth/reset-password", {
      email,
      resetToken,
      newPassword,
    });
  },

  // Google OAuth Login
  googleLogin: async (firebaseToken: string): Promise<AuthResponse> => {
    const data = await apiClient.post<any>("/auth/firebase", {
      firebaseToken,
    });

    // Store tokens
    if (data.tokens) {
      localStorage.setItem("accessToken", data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);
    }

    return {
      ...data,
      user: transformUser(data.user),
    };
  },
};
