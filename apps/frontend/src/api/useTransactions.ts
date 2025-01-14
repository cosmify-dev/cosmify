import { useQuery } from "@tanstack/vue-query";
import { injectApiClient } from "@/plugins/api";
import type { Ref } from "vue";
import type { AxiosResponse } from "axios";
import type { Transaction } from "@/utils/types/transaction.type";
import { TransactionStatus } from "@/utils/types/transaction.type";

const api = injectApiClient();

export const fetchTransaction = async (id: string): Promise<Transaction> => {
  const response: AxiosResponse<{ item: Transaction }> = await api.get(`/v1/transactions/${id}`);
  return response.data.item;
};

export const useTransactionQuery = (
  id: Ref<string | undefined>,
  refetchInterval: number = 1000
) => {
  const query = useQuery({
    queryKey: ["transactions", id],
    queryFn: async (): Promise<Transaction | undefined> => {
      if (!id.value) return undefined;
      return await fetchTransaction(id.value);
    },
    refetchInterval: (query) => {
      const data: Transaction | undefined = query.state.data;
      return data?.status &&
        (data.status === TransactionStatus.PENDING || data.status === TransactionStatus.EXECUTING)
        ? refetchInterval
        : false;
    },
    enabled: () => !!id.value
  });

  return {
    ...query
  };
};
