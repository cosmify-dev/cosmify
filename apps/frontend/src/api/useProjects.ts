import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { injectApiClient } from "@/plugins/api";
import { ref } from "vue";
import type { Ref } from "vue";
import type { MutationResult } from "@/utils/types/mutation.type";
import {
  type Callbacks,
  useDeleteOneMutation,
  useFetchManyQuery,
  useFetchOneByQuery,
  useLazyFetchManyQuery
} from "@/api/utils";
import { useValidationErrors } from "@/api/utils";
import {
  type CreateProjectDto,
  newCreateProjectDto,
  type Project,
  type UpdateProjectDto
} from "@/utils/types/project.type";

const api = injectApiClient();
const uri = "/v1/projects";

export const useProjectsQuery = () => useFetchManyQuery<Project>(api, uri);

export const useProjectQuery = (id: string, callbacks?: Callbacks<Project, Error>) =>
  useFetchOneByQuery<Project>(api, uri, id, callbacks);

export const useLazyProjectsQuery = (selectedId?: Ref<string | undefined>) =>
  useLazyFetchManyQuery<Project>(api, uri, selectedId);

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();
  const dto: Ref<CreateProjectDto> = ref<CreateProjectDto>(newCreateProjectDto());

  const mutation = useMutation({
    async mutationFn() {
      const response = await api.post<MutationResult<Project>>(uri, dto.value);
      return response.data.item;
    },
    onSuccess: async () =>
      await queryClient.invalidateQueries({
        queryKey: [uri]
      })
  });

  const validationErrors = useValidationErrors(mutation.error);

  const reset = () => {
    dto.value = newCreateProjectDto();
    mutation.reset();
  };

  return {
    ...mutation,
    reset,
    dto,
    validationErrors
  };
};

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    async mutationFn(data: { id: string; dto: UpdateProjectDto }) {
      const response = await api.patch<Project>(`${uri}/${data.id}`, data.dto);
      return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: [uri, data.id]
      });
    }
  });

  const validationErrors = useValidationErrors(mutation.error);

  return {
    ...mutation,
    validationErrors
  };
};

export const useDeleteProjectMutation = () => useDeleteOneMutation(api, uri);
