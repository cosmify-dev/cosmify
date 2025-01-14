import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { injectApiClient } from "@/plugins/api";
import { ref } from "vue";
import type { Ref } from "vue";
import type { CreateServerDto, Server, UpdateServerDto } from "@/utils/types/server.type";
import type { MutationResult } from "@/utils/types/mutation.type";
import { newCreateServerDto } from "@/utils/types/server.type";
import {
  type Callbacks,
  useCallbacks,
  useFetchManyQuery,
  useFetchOneByQuery,
  useLazyFetchManyQuery
} from "@/api/utils";
import { useValidationErrors } from "@/api/utils";
import type { AxiosResponse } from "axios";
import type { Network } from "@/utils/types/network.type";

const api = injectApiClient();

export const useServersQuery = () => useFetchManyQuery<Server>(api, "/v1/servers");

export const useServerQuery = (id: string, callbacks?: Callbacks<Server, Error>) =>
  useFetchOneByQuery<Server>(api, "/v1/servers", id, callbacks);

export const useLazyServersQuery = (selectedId?: Ref<string | undefined>) =>
  useLazyFetchManyQuery<Server>(api, "/v1/servers", selectedId);

export const useServerDefaultNetworkQuery = (
  id: Ref<string | undefined>,
  callbacks?: Callbacks<Network, Error>
) => {
  const query = useQuery({
    queryKey: ["servers", id, "defaultNetwork"],
    retry: 0,
    async queryFn() {
      const response = await api.get<Network>(`/v1/servers/${id.value}/defaultNetwork`);
      return response.data;
    },
    enabled: () => !!id.value
  });

  if (callbacks) useCallbacks(query, callbacks);

  return {
    ...query
  };
};

export const useCreateServerMutation = () => {
  const queryClient = useQueryClient();
  const dto: Ref<CreateServerDto> = ref<CreateServerDto>(newCreateServerDto());

  const mutation = useMutation({
    async mutationFn() {
      const response = await api.post<MutationResult<Server>>("/v1/servers", dto.value);
      return response.data.item;
    },
    onSuccess: async () =>
      await queryClient.invalidateQueries({
        queryKey: ["/v1/servers"]
      })
  });

  const validationErrors = useValidationErrors(mutation.error);

  const reset = () => {
    dto.value = newCreateServerDto();
    mutation.reset();
  };

  return {
    ...mutation,
    reset,
    dto,
    validationErrors
  };
};

export const useUpdateServerMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    async mutationFn(data: { id: string; dto: UpdateServerDto }) {
      const response = await api.patch<Server>(`/v1/servers/${data.id}`, data.dto);
      return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["/v1/servers", data.id]
      });
    }
  });

  const validationErrors = useValidationErrors(mutation.error);

  return {
    ...mutation,
    validationErrors
  };
};

export const useInitServerMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    async mutationFn(id: string) {
      const response: AxiosResponse<{
        transactionId: string;
      }> = await api.patch(`/v1/servers/${id}/init`);
      return response.data.transactionId;
    },
    onSuccess: async (id) => {
      await queryClient.invalidateQueries({
        queryKey: ["servers", id]
      });
    }
  });

  const validationErrors = useValidationErrors(mutation.error);

  return {
    ...mutation,
    validationErrors
  };
};

export const useDeleteServerMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete<void>(`/v1/servers/${id}`);
    },
    onMutate: () =>
      queryClient.invalidateQueries({
        queryKey: ["servers"]
      })
  });

  return {
    ...mutation
  };
};
