import { createAuthClient } from "better-auth/vue";
import { organizationClient, usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: `${import.meta.env.VITE_APP_API_URL}/v1/auth`,
  plugins: [organizationClient(), usernameClient()]
});
