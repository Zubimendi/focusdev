import axios from "axios";
import * as SecureStore from "expo-secure-store";
import {
  LoginSchema,
  RegisterSchema,
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
    const data = err.response.data as { error?: string } | undefined;
    if (status === 401) return new Error("Invalid email or password.");
    if (status === 409) {
      return new Error("An account with this email already exists.");
    }
    if (status === 400) {
      return new Error(
        data?.error && !/mongo|stack|uri|localhost/i.test(data.error)
          ? data.error
          : "Check your details and try again."
      );
    }
    console.warn(`[auth] server ${status}`, data);
    return new Error(fallback);
  }
  if (err instanceof Error) {
    // Never surface raw Error.message if it looks technical
    if (/http|api|metro|timeout|ECONN|ENOTFOUND|network/i.test(err.message)) {
      console.warn("[auth]", err.message);
      return new Error(fallback);
    }
    return err;
  }
  return new Error(fallback);
}

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

  async login(data: unknown): Promise<AuthResponse> {
    const validation = LoginSchema.safeParse(data);
    if (!validation.success) {
      throw formatAuthError(validation.error, "Couldn't sign you in.");
    }
    try {
      const response = await api.post("/auth/login", validation.data);
      const { token, user } = response.data;
      await SecureStore.setItemAsync("auth_token", token);
      return { token, user };
    } catch (err) {
      throw formatAuthError(err, "Couldn't sign you in.");
    }
  },

  async logout() {
    await SecureStore.deleteItemAsync("auth_token");
  },

  async getMe(): Promise<ApiResponse<unknown>> {
    const token = await SecureStore.getItemAsync("auth_token");
    if (!token) throw new Error("Not signed in");

    const response = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
