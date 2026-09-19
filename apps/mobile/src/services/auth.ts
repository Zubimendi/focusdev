import axios from "axios";
import * as SecureStore from "expo-secure-store";
import {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  type ApiResponse,
  type AuthResponse,
} from "@focus/shared";
import { api, API_URL } from "./api";

/** User-facing messages only — never leak URLs, IPs, or stack details into UI. */
function formatAuthError(err: unknown, fallback: string): Error {
  if (err && typeof err === "object" && "issues" in err) {
    return new Error("Check your details and try again.");
  }
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNABORTED" || !err.response) {
      console.warn(`[auth] network/timeout talking to ${API_URL}`, err.message);
      return new Error(
        "Couldn't reach the server. Check your connection and try again."
      );
    }
    const status = err.response.status;
    const data = err.response.data as { error?: string; message?: string } | undefined;
    const msg = data?.error || data?.message;
    if (status === 401) {
      return new Error(
        msg && !/mongo|stack|uri|localhost|http/i.test(msg)
          ? msg
          : "Invalid email or password."
      );
    }
    if (status === 409) {
      return new Error("An account with this email already exists.");
    }
    if (status === 400) {
      return new Error(
        msg && !/mongo|stack|uri|localhost|http/i.test(msg)
          ? msg
          : "Check your details and try again."
      );
    }
    console.warn(`[auth] server ${status}`, data);
    return new Error(fallback);
  }
  if (err instanceof Error) {
    if (/http|api|metro|timeout|ECONN|ENOTFOUND|network/i.test(err.message)) {
      console.warn("[auth]", err.message);
      return new Error(fallback);
    }
    return err;
  }
  return new Error(fallback);
}

async function authHeaders() {
  const token = await SecureStore.getItemAsync("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type LoginResult =
  | ({ requires2FA: false } & AuthResponse)
  | { requires2FA: true; pendingToken: string };

export const authService = {
  async register(data: unknown): Promise<ApiResponse<unknown>> {
    const validation = RegisterSchema.safeParse(data);
    if (!validation.success) {
      throw formatAuthError(validation.error, "Couldn't create your account.");
    }
    try {
      const response = await api.post("/auth/register", validation.data);
      return response.data;
    } catch (err) {
      throw formatAuthError(err, "Couldn't create your account.");
    }
  },

  async login(data: unknown): Promise<LoginResult> {
    const validation = LoginSchema.safeParse(data);
    if (!validation.success) {
      throw formatAuthError(validation.error, "Couldn't sign you in.");
    }
    try {
      const response = await api.post("/auth/login", validation.data);
      const body = response.data as {
        requires2FA?: boolean;
        pendingToken?: string;
        token?: string;
        user?: AuthResponse["user"];
      };

      if (body.requires2FA && body.pendingToken) {
        return { requires2FA: true, pendingToken: body.pendingToken };
      }

      const { token, user } = body;
      if (!token || !user) {
        throw new Error("Couldn't sign you in.");
      }
      await SecureStore.setItemAsync("auth_token", token);
      return { requires2FA: false, token, user };
    } catch (err) {
      throw formatAuthError(err, "Couldn't sign you in.");
    }
  },

  async verify2FA(
    pendingToken: string,
    code: string
  ): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/2fa/verify", {
        pendingToken,
        code,
      });
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error("Invalid verification code.");
      }
      await SecureStore.setItemAsync("auth_token", token);
      return { token, user };
    } catch (err) {
      throw formatAuthError(err, "Invalid verification code.");
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const validation = ForgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      throw new Error("Enter a valid email address.");
    }
    try {
      const response = await api.post("/auth/forgot-password", validation.data);
      return response.data;
    } catch (err) {
      throw formatAuthError(err, "Couldn't send reset instructions.");
    }
  },

  async resetPassword(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    const validation = ResetPasswordSchema.safeParse({ token, password });
    if (!validation.success) {
      throw new Error(
        "Use a strong password: 10+ characters with upper, lower, number, and special character."
      );
    }
    try {
      const response = await api.post("/auth/reset-password", validation.data);
      return response.data;
    } catch (err) {
      throw formatAuthError(err, "Couldn't reset your password.");
    }
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const validation = ChangePasswordSchema.safeParse({
      currentPassword,
      newPassword,
    });
    if (!validation.success) {
      throw new Error(
        "Check your current password and new password requirements."
      );
    }
    try {
      const headers = await authHeaders();
      const response = await api.post(
        "/auth/change-password",
        validation.data,
        { headers }
      );
      return response.data;
    } catch (err) {
      throw formatAuthError(err, "Couldn't update your password.");
    }
  },

  async logout() {
    await SecureStore.deleteItemAsync("auth_token");
  },

  async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync("auth_token");
  },

  async getMe(): Promise<{ user: AuthResponse["user"] }> {
    const headers = await authHeaders();
    const token = await SecureStore.getItemAsync("auth_token");
    if (!token) throw new Error("Not signed in");

    const response = await api.get("/auth/me", { headers });
    return response.data;
  },
};
