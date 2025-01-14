import { Server } from "../server/index.js";

export type Command =
  | {
      command: string;
      args?: (string | number)[];
      sudo?: boolean;
      converters?: ((server: Server, result: Result) => Promise<void>)[];
    }
  | string;

export type CommandExecutionOptions = {
  cwd: string;
};

export const convertCommandToString = (command: Command): string => {
  if (typeof command === "string") {
    return command;
  }
  return `${command.sudo ? "sudo " : ""}${command.command} ${command.args?.join(" ")}`;
};

export type Result = {
  success: boolean;
  code: number | null;
  signal: string | null;
  stdout: string;
  stderr: string;
};

export const defaultResult = () => {
  return {
    success: false,
    code: 1,
    signal: null,
    stdout: "",
    stderr: ""
  };
};
