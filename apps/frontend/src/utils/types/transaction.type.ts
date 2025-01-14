import type { Action } from "@/utils/types/action.type";

export type Transaction = {
  id: string;
  status: TransactionStatus;
  actions: Action[];
};

export enum TransactionStatus {
  "PENDING" = "PENDING",
  "EXECUTING" = "EXECUTING",
  "SUCCESS" = "SUCCESS",
  "ERROR" = "ERROR"
}
