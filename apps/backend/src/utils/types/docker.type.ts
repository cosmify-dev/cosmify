import { Container } from "inversify";

export type ComposeFile = {
  fluxName: string;
  containers: Container[];
};

export interface DockerContainerStats {
  MemUsage: string;
  MemPerc: string;
  CPUPerc: string;
  NetIO: string;
}

export interface ContainerStats {
  memory_usage: string;
  memory_percentage: string;
  cpu_percentage: string;
  network_io: string;
}
