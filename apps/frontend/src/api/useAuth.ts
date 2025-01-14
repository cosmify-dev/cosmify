import { useQuery } from "@tanstack/vue-query";
import axios from "axios";
import type { Team } from "@/utils/types/team.type";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_URL}`,
  withCredentials: true
});

export const useCsrfTokenQuery = () => {
  const query = useQuery({
    queryKey: ["auth", "csrf", "token"],
    queryFn: async () => {
      const response = await api.get<{
        csrfToken: string;
      }>(`/auth/csrf`);
      return response.data.csrfToken;
    }
  });

  return {
    ...query,
    apiUrl: `${import.meta.env.VITE_APP_API_URL}`,
    appUrl: `${import.meta.env.VITE_APP_URL}`
  };
};

export const useTeamsQuery = () => {
  const query = useQuery({
    queryKey: ["/v1/auth/teams"],
    queryFn: async () => {
      const response = await api.get<Pick<Team, "name">[]>(`/v1/auth/teams`, {
        withCredentials: true
      });
      return response.data;
    }
  });

  return {
    ...query
  };
};
