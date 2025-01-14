import { ServerStatus } from "@/utils/types/action.type";

export type Server = {
  id: string;
  name: string;
  description?: string;
  ip: string;
  port: number;
  user: string;
  status: ServerStatus;
  prettyOs?: string;
  privateKey: string;
  createdAt: string;
};

export type CreateServerDto = Omit<Server, "id" | "prettyOs" | "createdAt" | "status">;
export type UpdateServerDto = Partial<Omit<Server, "id" | "prettyOs" | "createdAt" | "status">>;

export const newCreateServerDto: () => CreateServerDto = () => {
  return {
    name: "traefik",
    description: "",
    ip: "167.235.31.43",
    port: 22,
    user: "root",
    privateKey: ""
  };
};

export function convertServerStatusToColor(
  severity: ServerStatus | undefined
): "secondary" | "success" | "info" | "warn" | "danger" | "contrast" | undefined {
  switch (severity) {
    case ServerStatus.ONLINE:
      return "success";
    case ServerStatus.OFFLINE:
      return "danger";
    case ServerStatus.PENDING:
      return "warn";
    case ServerStatus.INITIALIZING:
      return "info";
    case ServerStatus.DELETING:
      return "danger";
    default:
      return undefined;
  }
}
