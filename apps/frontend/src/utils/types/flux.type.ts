import { FluxStatus } from "@/utils/types/action.type";
import type { Server } from "@/utils/types/server.type";
import type { Network } from "@/utils/types/network.type";
import type { BaseEntity, ID } from "@/utils/types/id.type";

export type Container = ID & {
  name: string;
  image: string;
  command: string[];
  labels: string[];
  ports: Port[];
  networks: Network[];
  environmentVars: EnvironmentVar[];
  createdAt: string;
  updatedAt: string;
};

export type CreateContainerDto = Omit<
  Container,
  "id" | "createdAt" | "updatedAt" | "ports" | "networks" | "environmentVars" | "volumes"
> & {
  ports: CreatePortDto[];
  networks: string[];
  environmentVars: CreateEnvironmentVar[];
  volumes: CreateVolumeDto[];
};

export type Flux = BaseEntity & {
  name: string;
  server: Server;
  containers: Container[];
  shutdownTimeout: number;
  status: FluxStatus;
  createdAt: string;
  updatedAt: string;
};

export enum FluxAction {
  "START",
  "STOP",
  "RESTART",
  "REFRESH_IMAGES"
}

export type CreateFluxDto = Omit<
  Flux,
  "id" | "server" | "containers" | "updatedAt" | "createdAt" | "status" | "shutdownTimeout"
> & {
  project?: string;
  environment?: string;
  server: string;
  containers: CreateContainerDto[];
};

export type UpdateFluxDto = {
  shutdownTimeout?: number;
};

export type Port = BaseEntity & {
  hostPort: number;
  containerPort: number;
  container: Container;
  createdAt: string;
  updatedAt: string;
};

export type CreatePortDto = Omit<Port, "id" | "container" | "createdAt" | "updatedAt">;

export enum FileType {
  FILE = "file",
  DIRECTORY = "directory"
}

export type Volume = BaseEntity & {
  hostPath: string;
  create: boolean;
  permission: number;
  containerPath: string;
  readonly: boolean;
  type: FileType;
  container: Container;
  createdAt: string;
  updatedAt: string;
};

export type CreateVolumeDto = Omit<Volume, "id" | "container" | "createdAt" | "updatedAt">;

export type EnvironmentVar = BaseEntity & {
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateEnvironmentVar = Omit<EnvironmentVar, "id" | "createdAt" | "updatedAt">;

export const emptyCreateFluxDto = (project?: string, environment?: string): CreateFluxDto => ({
  project: project,
  environment: environment,
  name: "",
  server: "",
  containers: []
});

export const emptyCreateContainerDto = (): CreateContainerDto => ({
  name: "",
  image: "",
  networks: [],
  ports: [],
  command: [],
  volumes: [],
  environmentVars: [],
  labels: [
    "traefik.enable=true",
    "traefik.http.routers.whoami.rule=Host(`whoami.example.com`)",
    "traefik.http.routers.whoami.entrypoints=websecure",
    "traefik.http.routers.whoami.tls.certresolver=proxy"
  ]
});

export const newProxyFluxDto = (data: {
  serverId: string;
  networkIds: string[];
  email: string;
}): CreateFluxDto => {
  return {
    project: "",
    environment: "",
    name: "proxy",
    server: data.serverId,
    containers: [
      {
        name: "main",
        image: "traefik:v3.1",
        command: [
          "--providers.docker=true",
          "--providers.docker.exposedbydefault=false",
          "--entryPoints.web.address=:80",
          "--entryPoints.websecure.address=:443",
          `--certificatesresolvers.proxy.acme.email=${data.email}`,
          "--certificatesresolvers.proxy.acme.storage=/acme.json",
          "--certificatesresolvers.proxy.acme.httpchallenge.entrypoint=web",
          "--certificatesresolvers.proxy.acme.tlschallenge=true"
        ],
        environmentVars: [],
        volumes: [
          {
            create: false,
            permission: 0,
            type: FileType.FILE,
            hostPath: "/var/run/docker.sock",
            containerPath: "/var/run/docker.sock",
            readonly: true
          },
          {
            create: true,
            permission: 600,
            type: FileType.FILE,
            hostPath: "./acme.json",
            containerPath: "/acme.json",
            readonly: false
          }
        ],
        networks: data.networkIds,
        ports: [
          {
            hostPort: 80,
            containerPort: 80
          },
          {
            hostPort: 443,
            containerPort: 443
          },
          {
            hostPort: 8080,
            containerPort: 8080
          }
        ],
        labels: []
      }
    ]
  };
};

export type ContainerStats = {
  memory_usage: string;
  memory_percentage: string;
  cpu_percentage: string;
  network_io: string;
};

export const parseContainerStats = (stats: ContainerStats | undefined) => {
  if (!stats) return {};

  const cpuUsage = parseFloat(stats.cpu_percentage.replace("%", ""));

  const memoryUsage = parseFloat(stats.memory_percentage.replace("%", ""));

  const [used, total] = stats.memory_usage.split(" / ").map((val) => {
    if (val.endsWith("MiB")) return parseFloat(val.replace("MiB", "")) * 1024 * 1024;
    if (val.endsWith("GiB")) return parseFloat(val.replace("GiB", "")) * 1024 * 1024 * 1024;
    if (val.endsWith("KiB")) return parseFloat(val.replace("KiB", "")) * 1024;
    return parseFloat(val);
  });

  const [rx, tx] = stats.network_io.split(" / ").map((val) => {
    if (val.endsWith("KB")) return parseFloat(val.replace("KB", "")) * 1024;
    if (val.endsWith("MB")) return parseFloat(val.replace("MB", "")) * 1024 * 1024;
    if (val.endsWith("GB")) return parseFloat(val.replace("GB", "")) * 1024 * 1024 * 1024;
    return parseFloat(val);
  });

  const networkTotal = rx + tx;

  return {
    cpuUsage,
    memoryUsed: used,
    memoryTotal: total,
    memoryUsage,
    networkRx: rx,
    networkTx: tx,
    networkTotal
  };
};

export type ContainerLogs = {
  stdout: string;
  stderr: string;
};

export function convertFluxStatusToColor(
  severity: FluxStatus | undefined
): "secondary" | "success" | "info" | "warn" | "danger" | "contrast" | undefined {
  switch (severity) {
    case FluxStatus.ONLINE:
      return "success";
    case FluxStatus.OFFLINE:
      return "danger";
    case FluxStatus.PENDING:
      return "warn";
    case FluxStatus.DELETING:
      return "danger";
    default:
      return undefined;
  }
}
