import { type Callbacks, useFetchOneByQuery, useValidationErrors } from "@/api/utils";
import type { Team, UpdateTeamDto } from "@/utils/types/team.type";
import { injectApiClient } from "@/plugins/api";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

const api = injectApiClient();

export const useTeamQuery = (id: string, callbacks?: Callbacks<Team, Error>) =>
  useFetchOneByQuery<Team>(api, "/v1/auth/teams", id, callbacks);

export const useUpdateTeamMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    async mutationFn(data: { id: string; dto: UpdateTeamDto }) {
      const response = await api.patch<Team>(`/v1/auth/teams/${data.id}`, data.dto);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["/v1/auth/teams"]
      });
    }
  });

  const validationErrors = useValidationErrors(mutation.error);

  return {
    ...mutation,
    validationErrors
  };
};
