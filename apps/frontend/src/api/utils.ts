import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryReturnType
} from "@tanstack/vue-query";
import { computed, watch } from "vue";
import type { Ref } from "vue";
import { AxiosError, type AxiosInstance } from "axios";
import { Pagination, type PaginationResult } from "@/utils/types/pagination.type";
import type { VirtualScrollerScrollIndexChangeEvent } from "primevue/virtualscroller";
import type { ID } from "@/utils/types/id.type";
import type { ValidationErrors } from "@/utils/types/validation.type";

export interface Callbacks<TData, TError> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
}

export const useCallbacks = <TData, TError>(
  query: UseQueryReturnType<TData, TError>,
  callbacks: Callbacks<TData, TError>
) => {
  const { onSuccess, onError } = callbacks;

  watch(
    () => query.isSuccess.value,
    () => {
      if (query.isSuccess.value) {
        onSuccess?.(query.data.value as TData);
      }
    }
  );

  watch(
    () => query.isError.value,
    () => {
      if (query.isError.value) {
        onError?.(query.error.value as TError);
      }
    }
  );
};

export const useValidationErrors = (error: Ref<unknown>) => {
  return computed(() => {
    if (!(error.value instanceof AxiosError)) return {};
    const { status, data } = error.value.response || {};
    const validationErrors = data.data;
    if (status === 400 && data?.error === "VALIDATION_ERROR" && data?.data) return validationErrors;
    return {};
  });
};

export const useValidationErrorCount = (validationErrors: Ref<ValidationErrors>) => {
  return computed(() => countValidationErrors(validationErrors.value));
};

const countValidationErrors = (errors: ValidationErrors | string[]): number => {
  if (Array.isArray(errors)) return errors.length;
  if (typeof errors === "object" && errors !== null)
    return Object.values(errors).reduce((total, value) => total + countValidationErrors(value), 0);
  return 0;
};

export const useFetchManyQuery = <T>(
  api: AxiosInstance,
  uri: string,
  callbacks?: Callbacks<PaginationResult<T>, Error>
) => {
  const pagination = new Pagination(1, 10);

  const query = useQuery({
    queryKey: [uri, pagination.page, pagination.pageSize],
    placeholderData: keepPreviousData,
    queryFn: () => fetchMany<T>(api, uri, pagination.page.value, pagination.pageSize.value)
  });

  const totalItems = computed(() => query.data.value?.total);

  if (callbacks) useCallbacks(query, callbacks);

  return {
    ...query,
    pagination,
    totalItems
  };
};

export const useLazyFetchManyQuery = <T extends ID>(
  api: AxiosInstance,
  uri: string,
  selectedItemId?: Ref<string | undefined>
) => {
  const query = useInfiniteQuery({
    queryKey: [uri],
    initialPageParam: 1,
    queryFn({ pageParam }) {
      return fetchMany<T>(api, uri, pageParam, 10);
    },
    getNextPageParam(lastPage) {
      return lastPage.data.length > 0 ? lastPage.page + 1 : undefined;
    }
  });

  const selectedItem = useQuery({
    queryKey: [uri, selectedItemId],
    queryFn: () => fetchOneBy<T>(api, uri, selectedItemId?.value),
    enabled: () => !!selectedItemId?.value
  });

  const items = computed(() => {
    const lazyLoadedItems = query.data.value?.pages.flatMap((page) => page.data || []) || [];

    if (!selectedItem.data.value) return lazyLoadedItems;

    return [
      selectedItem.data.value,
      ...lazyLoadedItems.filter((item) => selectedItem.data.value?.id !== item.id)
    ].sort();
  });

  const load = async (e: VirtualScrollerScrollIndexChangeEvent) => {
    if (!query.hasNextPage.value || query.isFetchingNextPage.value || !items?.value) return;
    if (e.last > items.value.length - 1) await query.fetchNextPage();
  };

  return {
    ...query,
    items,
    load,
    selectedItem: selectedItem.data
  };
};

const fetchMany = async <T>(
  api: AxiosInstance,
  uri: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginationResult<T>> => {
  const response = await api.get<PaginationResult<T>>(uri, {
    params: {
      page,
      pageSize
    }
  });
  return response.data;
};

export const useFetchOneByQuery = <T>(
  api: AxiosInstance,
  uri: string,
  id: string,
  callbacks?: Callbacks<T, Error>
) => {
  const query = useQuery({
    queryKey: [uri, id],
    retry: 0,
    queryFn: () => fetchOneBy<T>(api, uri, id)
  });

  if (callbacks) useCallbacks(query, callbacks);

  return {
    ...query
  };
};

const fetchOneBy = async <T>(
  api: AxiosInstance,
  uri: string,
  id: string | undefined
): Promise<T> => {
  const response = await api.get<T>(`${uri}/${id}`);
  return response.data;
};

export const useDeleteOneMutation = (api: AxiosInstance, uri: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete<void>(`${uri}/${id}`);
    },
    onMutate: () =>
      queryClient.invalidateQueries({
        queryKey: [uri]
      })
  });

  return {
    ...mutation
  };
};
