import {
  keepPreviousData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/vue-query";
import { injectApiClient } from "@/plugins/api";
import type { PaginationResult } from "@/utils/types/pagination.type";
import { computed, ref } from "vue";
import type { Ref } from "vue";
import { Pagination } from "@/utils/types/pagination.type";
import type { MutationResult } from "@/utils/types/mutation.type";
import type { Network, PostNetworkDto } from "@/utils/types/network.type";
import { emptyPostNetworkDto } from "@/utils/types/network.type";
import { useLazyFetchManyQuery, useValidationErrors } from "@/api/utils";
import type { VirtualScrollerScrollIndexChangeEvent } from "primevue/virtualscroller";
import { emitter } from "@/stores/toast.store";
import { AxiosError } from "axios";

const api = injectApiClient();

const fetchNetworks = async (page: number, pageSize: number) => {
  const { data } = await api.get<PaginationResult<Network>>("/v1/networks", {
    params: {
      page: page,
      pageSize: pageSize
    }
  });
  return data;
};

export const useNetworksQuery = () => {
  const pagination = new Pagination(1, 10);

  const query = useQuery({
    queryKey: ["networks", pagination.page, pagination.pageSize],
    placeholderData: keepPreviousData,
    queryFn: () => fetchNetworks(pagination.page.value, pagination.pageSize.value)
  });

  const totalItems = computed(() => query.data.value?.total);

  return {
    ...query,
    pagination,
    totalItems
  };
};

export const useLazyNetworksQuery = (selectedId?: Ref<string | undefined>) =>
  useLazyFetchManyQuery<Network>(api, "/v1/networks", selectedId);

export const useCreateNetworkMutation = (onSuccess?: () => void) => {
  const api = injectApiClient();
  const dto: Ref<PostNetworkDto> = ref<PostNetworkDto>(emptyPostNetworkDto());

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<
        MutationResult<Network> & {
          actionId: string;
        }
      >("/v1/networks", dto.value);
      return response.data.item;
    },
    onSuccess: onSuccess
  });

  const validationErrors = useValidationErrors(mutation.error);

  const reset = () => {
    dto.value = emptyPostNetworkDto();
    mutation.reset();
  };

  return {
    ...mutation,
    reset,
    dto,
    validationErrors
  };
};

export const useDeleteNetworkMutation = () => {
  const queryClient = useQueryClient();
  const api = injectApiClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete<void>(`/v1/networks/${id}`);
    },
    onError: (error) => {
      if (!(error instanceof AxiosError)) return;
      const { status, data } = error.response || {};
      emitter.emit("add-toast", {
        closable: true,
        summary: "Failed to Delete Network",
        severity: "error",
        detail: data?.message,
        life: 60000
      });
    },
    onSuccess: invalidateQuery(queryClient, "networks")
  });

  return {
    ...mutation
  };
};

const invalidateQuery = (queryClient: QueryClient, key: string) => {
  return async () => {
    await queryClient.invalidateQueries({
      queryKey: [key]
    });
  };
};
