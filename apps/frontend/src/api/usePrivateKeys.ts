import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/vue-query";
import { injectApiClient } from "@/plugins/api";
import type { PaginationResult } from "@/utils/types/pagination.type";
import type { PostPrivateKeyDto, PrivateKey } from "@/utils/types/privatekey.type";
import { computed, ref } from "vue";
import type { Ref } from "vue";
import { Pagination } from "@/utils/types/pagination.type";
import type { MutationResult } from "@/utils/types/mutation.type";
import { emptyPostPrivateKeyDto } from "@/utils/types/privatekey.type";
import type { VirtualScrollerScrollIndexChangeEvent } from "primevue/virtualscroller";
import { type Callbacks, useCallbacks, useValidationErrors } from "@/api/utils";

const api = injectApiClient();

const fetchPrivateKeys = async (
  page: number,
  pageSize: number
): Promise<PaginationResult<PrivateKey>> => {
  const { data } = await api.get<PaginationResult<PrivateKey>>("/v1/security/keys", {
    params: {
      page,
      pageSize
    }
  });
  return data;
};

export const usePrivateKeysQuery = () => {
  const pagination = new Pagination(1, 10);

  const query = useQuery({
    queryKey: ["keys", pagination.page, pagination.pageSize],
    placeholderData: keepPreviousData,
    queryFn: () => fetchPrivateKeys(pagination.page.value, pagination.pageSize.value)
  });

  const totalItems = computed(() => query.data.value?.total);

  return {
    ...query,
    pagination,
    totalItems
  };
};

export const useLazyPrivateKeyQuery = (selectedPrivateKeyId?: Ref<string | undefined>) => {
  const query = useInfiniteQuery({
    queryKey: ["keys"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPrivateKeys(pageParam, 10),
    getNextPageParam: (lastPage) => (lastPage.data.length > 0 ? lastPage.page + 1 : undefined)
  });

  const selectedPrivateKey = useQuery({
    queryKey: ["keys", selectedPrivateKeyId?.value],
    queryFn: () => fetchPrivateKey(selectedPrivateKeyId?.value),
    enabled: () => !!selectedPrivateKeyId?.value
  });

  const items = computed(() => {
    const lazyLoadedItems = query.data.value?.pages.flatMap((page) => page.data || []) || [];

    if (!selectedPrivateKey.data.value) return lazyLoadedItems;

    return [
      selectedPrivateKey.data.value,
      ...lazyLoadedItems.filter((item) => selectedPrivateKey.data.value?.id !== item.id)
    ];
  });

  const load = async (e: VirtualScrollerScrollIndexChangeEvent) => {
    if (!query.hasNextPage.value || query.isFetchingNextPage.value || !items?.value) return;
    if (e.last > items.value.length - 1) await query.fetchNextPage();
  };

  return {
    ...query,
    items,
    load
  };
};

export const fetchPrivateKey = async (id: string | undefined): Promise<PrivateKey> => {
  const { data } = await api.get<PrivateKey>(`/v1/security/keys/${id}`);
  return data;
};

export const usePrivateKeyQuery = (id: string, callbacks?: Callbacks<PrivateKey, Error>) => {
  const query = useQuery({
    queryKey: ["keys", id],
    retry: 0,
    queryFn: () => fetchPrivateKey(id)
  });

  if (callbacks) useCallbacks(query, callbacks);

  return {
    ...query
  };
};

export const useCreatePrivateKeyMutation = () => {
  const queryClient = useQueryClient();
  const dto: Ref<PostPrivateKeyDto> = ref(emptyPostPrivateKeyDto());

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<MutationResult<PrivateKey>>("/v1/security/keys", dto.value);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["keys"]
      });
    }
  });

  const validationErrors = useValidationErrors(mutation.error);

  const reset = () => {
    mutation.reset();
    dto.value = emptyPostPrivateKeyDto();
  };

  return {
    ...mutation,
    dto,
    reset,
    validationErrors
  };
};

export const useDeletePrivateKeyMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete<void>(`/v1/security/keys/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["keys"]
      });
    }
  });

  return {
    ...mutation
  };
};
