import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { injectApiClient } from "@/plugins/api";
import type { PaginationResult } from "@/utils/types/pagination.type";
import { computed, type ComputedRef, ref, type Ref, watch } from "vue";
import type { MutationResult } from "@/utils/types/mutation.type";
import {
  type Callbacks,
  useFetchManyQuery,
  useFetchOneByQuery,
  useValidationErrorCount,
  useValidationErrors
} from "@/api/utils";
import {
  type ContainerLogs,
  type ContainerStats,
  type CreateFluxDto,
  type Flux,
  FluxAction,
  type UpdateFluxDto
} from "@/utils/types/flux.type";
import { watchDebounced } from "@vueuse/core";
import type { AxiosResponse } from "axios";
import { formatInTimeZone } from "date-fns-tz";

const api = injectApiClient();

export const useFluxorQuery = (callbacks?: Callbacks<PaginationResult<Flux>, Error>) =>
  useFetchManyQuery<Flux>(api, "/v1/fluxor", callbacks);

export const useFluxQuery = (id: string, callbacks?: Callbacks<Flux, Error>) => {
  const query = useFetchOneByQuery(api, "/v1/fluxor", id, callbacks);

  const { data: composeFile } = useQuery({
    queryKey: ["/v1/fluxor", id, "composeFile"],
    retry: 0,
    async queryFn() {
      const response: AxiosResponse<{
        content: string;
      }> = await api.get(`/v1/fluxor/${id}/composeFile`);
      return response.data.content;
    }
  });

  return {
    ...query,
    composeFile
  };
};

const sanitize = (dto: CreateFluxDto): CreateFluxDto => {
  const sanitizedDto: CreateFluxDto = JSON.parse(JSON.stringify(dto));

  for (const container of sanitizedDto.containers) {
    container.volumes = container.volumes.filter(
      ({ hostPath, containerPath }) => hostPath.length > 0 || containerPath.length > 0
    );

    container.environmentVars = container.environmentVars.filter(
      ({ key, value }) => key.length > 0 || value.length > 0
    );

    container.labels = container.labels.filter(Boolean);
    container.command = container.command.filter(Boolean);
  }

  return sanitizedDto;
};

export const useCreateFluxorMutation = (initializeDto: () => CreateFluxDto) => {
  const queryClient = useQueryClient();
  const dto: Ref<CreateFluxDto> = ref(initializeDto());
  const validationError = ref<unknown>();

  const mutation = useMutation({
    async mutationFn(): Promise<Flux> {
      const response = await api.post<MutationResult<Flux>>("/v1/fluxor", sanitize(dto.value));
      return response.data.item;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/v1/fluxor"]
      }),
    onError: (error) => {
      validationError.value = error;
    }
  });

  const { mutate: validate } = useMutation({
    async mutationFn(): Promise<boolean> {
      await api.post<MutationResult<Flux>>("/v1/fluxor/validate", sanitize(dto.value));
      return true;
    },
    onError: (error) => {
      validationError.value = error;
    }
  });

  const {
    mutate: validateComposeFile,
    data: composeFileContent,
    isPending: isComposeFilePending,
    isSuccess: isComposeFileSuccess
  } = useMutation({
    async mutationFn(): Promise<string> {
      const response = await api.post<{
        content: string;
      }>("/v1/fluxor/composeFile", sanitize(dto.value));
      return response.data.content;
    }
  });

  const validationErrors = useValidationErrors(validationError);
  const validationErrorCount = useValidationErrorCount(validationErrors);

  validateComposeFile();

  watchDebounced(
    () => dto.value,
    () => validateComposeFile(),
    {
      deep: true,
      debounce: 500
    }
  );

  const reset = () => {
    dto.value = initializeDto();
    mutation.reset();
    validateComposeFile();
  };

  return {
    ...mutation,
    reset,
    validate,
    composeFileContent,
    isComposeFilePending,
    isComposeFileSuccess,
    dto,
    validationErrors,
    validationErrorCount
  };
};

export const useFluxActionMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { id: string; action: FluxAction }) => {
      let uri = "";
      switch (data.action) {
        case FluxAction.RESTART:
          uri = "restart";
          break;
        case FluxAction.STOP:
          uri = "stop";
          break;
        case FluxAction.START:
          uri = "start";
          break;
      }

      await api.put<void>(`/v1/fluxor/${data.id}/${uri}`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/v1/fluxor"]
      })
  });

  return {
    ...mutation
  };
};

export const useFluxUpdateMutation = (flux: Ref<Flux | undefined>) => {
  const queryClient = useQueryClient();

  const dto = ref<UpdateFluxDto>({
    shutdownTimeout: flux.value?.shutdownTimeout
  });

  watch(
    () => flux.value,
    () => {
      dto.value.shutdownTimeout = flux.value?.shutdownTimeout;
    }
  );

  const mutation = useMutation({
    async mutationFn() {
      if (!flux.value) return;
      const response = await api.patch<Flux>(`/v1/fluxor/${flux.value?.id}`, dto.value);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["/v1/fluxor"]
      });
    }
  });

  const validationErrors = useValidationErrors(mutation.error);
  const isUpdated: ComputedRef<boolean> = computed(
    () => dto.value.shutdownTimeout !== flux.value?.shutdownTimeout
  );

  return {
    ...mutation,
    dto,
    isUpdated,
    validationErrors
  };
};

export const useContainerLogsQuery = (
  id: string,
  containerId: Ref<string>,
  from: Ref<Date>,
  to: Ref<Date>
) => {
  const query = useQuery({
    queryKey: ["fluxor", id, "logs"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!containerId.value) throw new Error("No container selected!");
      const response = await api.get<ContainerLogs>(
        `/v1/fluxor/${id}/containers/${containerId.value}/logs/query?since=${formatInTimeZone(
          from.value,
          "UTC",
          "yyyy-MM-dd'T'HH:mm:ss'Z'"
        )}&until=${formatInTimeZone(to.value, "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'")}`
      );
      return response.data;
    }
  });

  return {
    ...query
  };
};

export const useContainerStatsQuery = (id: string) => {
  const query = useQuery({
    queryKey: ["fluxor", id, "stats"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.get<Record<string, ContainerStats>>(
        `/v1/fluxor/${id}/stats/query`
      );
      return response.data;
    }
  });

  return {
    ...query
  };
};

export const useDeleteFluxMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete<void>(`/v1/fluxor/${id}`);
    },
    onMutate: () =>
      queryClient.invalidateQueries({
        queryKey: ["fluxor"]
      })
  });

  return {
    ...mutation
  };
};
