import { Transaction } from "../../transaction/transaction.entity.js";
import { Flux } from "../../fluxor/index.js";

export type ExecutionOptions = {
  transaction?: Transaction;
  flux?: Flux;
  async?: boolean;
  ignoreErrorsOfPreviousCommands?: boolean;
  enableCommandLogs?: boolean;
  cwd?: string;
};

export const defaultExecutionOptions: ExecutionOptions = {
  transaction: undefined,
  flux: undefined,
  async: true,
  ignoreErrorsOfPreviousCommands: false,
  enableCommandLogs: true,
  cwd: "/"
};

export type DirectoryOptions = {
  sudo?: boolean;
  mode?: string | number;
  createParents?: boolean;
};

export const defaultDirectoryOptions: DirectoryOptions = {
  sudo: false,
  mode: "",
  createParents: true
};

export type FileOptions = {
  recursive?: boolean;
  append?: boolean;
  sudo?: boolean;
  mode?: string | number;
};

export const defaultFileOptions: FileOptions = {
  recursive: false,
  append: false,
  sudo: false,
  mode: ""
};
