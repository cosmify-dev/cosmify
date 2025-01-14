import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    organizationId: ""
  }),
  persist: {
    pick: ["organizationId"]
  }
});

interface User {
  name: string;
  email: string;
  image: string;
}
