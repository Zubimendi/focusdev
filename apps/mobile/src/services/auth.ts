import axios from "axios";
import * as SecureStore from "expo-secure-store";
import {
  LoginSchema,
  RegisterSchema,
  type ApiResponse,
  type AuthResponse,
} from "@focus/shared";
import { api, API_URL } from "./api";

function formatAuthError(err: unknown, fallback: string): Error {
  if (err && typeof err === "object" && "issues" in err) {
    const issues = (err as { issues?: { message?: string }[] }).issues;
    const first = issues?.[0]?.message;
    if (first) return new Error(first);
  }
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNABORTED") {
      return new Error(
        `Timed out talking to ${API_URL}. Is Next.js running and is this the right IP?`
      );
    }
    if (!err.response) {
      return new Error(
        `Cannot reach API at ${API_URL}. Check Wi‑Fi, firewall, and apps/mobile/.env`
      );
    }
    const data = err.response.data as { error?: string };
    if (data?.error) return new Error(data.error);
    return new Error(`Server error (${err.response.status})`);
  }
  if (err instanceof Error) return err;
  return new Error(fallback);
}

export const authService = {
  async register(data: unknown): Promise<ApiResponse<unknown>> {
    const validation = RegisterSchema.safeParse(data);
    if (!validation.success) {
      throw formatAuthError(validation.error, "Invalid form input");
    }
    try {
      const response = await api.post("/auth/register", validation.data);
      return response.data;
    } catch (err) {
      throw formatAuthError(err, "Registration failed");
    }
  },

  async login(data: unknown): Promise<AuthResponse> {
    const validation = LoginSchema.safeParse(data);
    if (!validation.success) {
      throw formatAuthError(validation.error, "Invalid credentials");
    }
    try {
      const response = await api.post("/auth/login", validation.data);
      const { token, user } = response.data;
      await SecureStore.setItemAsync("auth_token", token);
      return { token, user };
    } catch (err) {
      throw formatAuthError(err, "Login failed");
    }
  },

  async logout() {
    await SecureStore.deleteItemAsync("auth_token");
  },

  async getMe(): Promise<ApiResponse<unknown>> {
    const token = await SecureStore.getItemAsync("auth_token");
    if (!token) throw new Error("No token found");

    const response = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
