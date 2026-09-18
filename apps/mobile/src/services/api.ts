import { Platform } from "react-native";
import axios from "axios";

/**
 * Mobile cannot use "localhost" for the API when running on a real device
 * or Android emulator — that points at the phone/emulator, not your PC.
 *
 * Set EXPO_PUBLIC_API_URL in apps/mobile/.env, e.g.:
 *   EXPO_PUBLIC_API_URL=http://192.168.1.42:3000/api
 */
function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api";
  }
  return "http://localhost:3000/api";
}

export const API_URL = resolveApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const method = (config.method || "get").toUpperCase();
  const url = `${config.baseURL || ""}${config.url || ""}`;
  console.log(`[API →] ${method} ${url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    const method = (response.config.method || "get").toUpperCase();
    const url = `${response.config.baseURL || ""}${response.config.url || ""}`;
    console.log(`[API ←] ${response.status} ${method} ${url}`);
    return response;
  },
  (error) => {
    const method = (error.config?.method || "get").toUpperCase();
    const url = `${error.config?.baseURL || ""}${error.config?.url || ""}`;
    if (error.response) {
      console.log(
        `[API ←] ${error.response.status} ${method} ${url}`,
        error.response.data
      );
    } else if (error.code === "ECONNABORTED") {
      console.log(`[API ✕] TIMEOUT ${method} ${url}`);
    } else {
      console.log(`[API ✕] NETWORK ${method} ${url}`, error.message);
    }
    return Promise.reject(error);
  }
);

if (__DEV__) {
  console.log(`[FocusDev] API base URL → ${API_URL}`);
}
