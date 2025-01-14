import type { AxiosInstance } from "axios";
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { getActivePinia } from "pinia";
import router from "@/router";

let axiosInstance: AxiosInstance | null = null;

export function injectApiClient(): AxiosInstance {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      baseURL: `${import.meta.env.VITE_APP_API_URL}`,
      withCredentials: true
    });

    const pinia = getActivePinia();
    if (!pinia) throw new Error("Pinia must be active.");

    const authStore = useAuthStore(pinia);

    axiosInstance.interceptors.request.use((config) => {
      if (authStore.organizationId) config.headers["X-Team-Id"] = authStore.organizationId;
      return config;
    });

    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response.status === 401) {
          await router.push("/auth/login");
        }
        return Promise.reject(error as Error);
      }
    );
  }
  return axiosInstance;
}
