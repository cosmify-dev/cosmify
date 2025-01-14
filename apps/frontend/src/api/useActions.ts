import { useQuery } from "@tanstack/vue-query";
import { injectApiClient } from "@/plugins/api";
import type { Ref } from "vue";
import { type Action, type ServerStatus, Status } from "@/utils/types/action.type";
import { Pagination, type PaginationResult } from "@/utils/types/pagination.type";

const api = injectApiClient();

export const useActionsQuery = (uri: string, id: string, refetchInterval: number = 1000) => {
  const pagination = new Pagination(1, 10);

  const query = useQuery({
    queryKey: [uri, id, "actions", pagination.page, pagination.pageSize],
    async queryFn(): Promise<PaginationResult<Action>> {
      const response = await api.get(`${uri}/${id}/actions`, {
        params: {
          page: pagination.page.value,
          pageSize: pagination.pageSize.value
        }
      });
      return response.data;
    },
    refetchInterval: (query) => {
      const actions: PaginationResult<Action> | undefined = query.state.data;
      if (actions === undefined) return false;
      return actions.data.find((action) => action.status === Status.EXECUTING) !== undefined
        ? refetchInterval
        : false;
    }
  });

  return {
    ...query,
    pagination
  };
};

export const useUptimeActionQuery = (serverId: string) => {
  const query = useQuery({
    queryKey: ["servers", serverId, "actions", "uptime"],
    queryFn: async () => {
      const response = await api.get<{
        pretty: string;
      }>(`/v1/servers/${serverId}/actions/uptime`);
      return response.data.pretty;
    }
  });

  return {
    ...query
  };
};

export const useServerConnectivityActionQuery = (serverId: Ref<string | undefined>) => {
  const query = useQuery({
    queryKey: ["servers", serverId.value, "actions", "checkConnectivity"],
    queryFn: async () => {
      const response = await api.post<{
        status: ServerStatus;
      }>(`/v1/servers/${serverId.value}/actions/checkConnectivity`);
      return response.data.status;
    },
    enabled: () => !!serverId.value
  });

  return {
    ...query
  };
};
