import { inject, injectable } from "inversify";
import YAML from "yaml";
import { ContainerStats, DockerContainerStats } from "../utils/types/docker.type.js";
import {
  ActionResult,
  ActionType,
  CommandActionResult,
  type IActionService
} from "../actions/index.js";
import { Command, InternalServerError, NotFoundError, Result } from "../utils/index.js";
import { ExecutionOptions } from "../utils/types/options.type.js";
import { Timeframe } from "../validations/timeframe.validation.js";
import { TYPES } from "../TYPES.js";
import { Container } from "../container/container.entity.js";

export interface IDockerService {
  generateComposeFileContent(baseName: string, containers: Container[]): string;

  pullImage(
    organizationId: string,
    serverId: string,
    image: string,
    options?: ExecutionOptions
  ): Promise<ActionResult>;

  start(
    organizationId: string,
    serverId: string,
    name: string,
    composeFilePath: string,
    options?: ExecutionOptions
  ): Promise<ActionResult>;

  restart(
    organizationId: string,
    serverId: string,
    name: string,
    composeFilePath: string,
    options?: ExecutionOptions
  ): Promise<ActionResult>;

  stop(
    organizationId: string,
    serverId: string,
    name: string,
    composeFilePath: string | null | undefined,
    timeoutSeconds: number,
    options?: ExecutionOptions
  ): Promise<ActionResult>;

  queryStats(
    organizationId: string,
    serverId: string,
    containerNames: string[],
    options?: ExecutionOptions
  ): Promise<Record<string, ContainerStats>>;

  queryLogs(
    organizationId: string,
    serverId: string,
    containerName: string,
    timeframe?: Timeframe,
    options?: ExecutionOptions
  ): Promise<Result>;

  createNetwork(
    organizationId: string,
    serverId: string,
    name: string,
    options?: ExecutionOptions
  ): Promise<ActionResult>;

  removeNetwork(
    organizationId: string,
    serverId: string,
    name: string,
    options?: ExecutionOptions
  ): Promise<CommandActionResult>;
}

type Services = {
  [key: string]: {
    container_name: string;
    labels?: string[];
    image: string;
    command?: string[];
    networks?: string[];
    ports?: string[];
    volumes?: string[];
  };
};

@injectable()
export class DockerService implements IDockerService {
  constructor(
    @inject(TYPES.ActionService)
    private readonly actionService: IActionService
  ) {}

  public generateComposeFileContent = (baseName: string, containers: Container[]) => {
    const uniqueNetworks = Array.from(
      containers
        .flatMap((container) => container.networks)
        .reduce((map, network) => {
          if (!map.has(network.name)) map.set(network.name, network);
          return map;
        }, new Map())
        .values()
    );

    return YAML.stringify({
      services: containers.reduce((obj, container) => {
        const key = `${baseName}_${container.name}`;
        obj[key] = {
          container_name: key,
          labels: container.labels.length > 0 ? container.labels : undefined,
          image: container.image,
          command: container.command.length > 0 ? container.command : undefined,
          networks:
            container.networks.length > 0
              ? container.networks.map((network) => network.name)
              : undefined,
          ports:
            container.ports.length > 0
              ? container.ports.map((port) => `${port.hostPort}:${port.containerPort}`)
              : undefined,
          volumes:
            container.volumes.length > 0
              ? container.volumes.map(
                  (volume) =>
                    `${volume.hostPath}:${volume.containerPath}${volume.readonly ? ":ro" : ":rw"}`
                )
              : undefined
        };
        return obj;
      }, {} as Services),
      networks:
        uniqueNetworks.length > 0
          ? Object.fromEntries(
              uniqueNetworks.map((network) => {
                return [network.name, { external: true }];
              })
            )
          : undefined
    });
  };

  public pullImage = async (
    organizationId: string,
    serverId: string,
    image: string,
    options?: ExecutionOptions
  ) => {
    return await this.actionService.executeCommandAction(
      organizationId,
      serverId,
      [`echo "Pulling image ${image}..."`, `docker pull ${image}`],
      ActionType.PULL_IMAGE,
      options
    );
  };

  public start = (
    organizationId: string,
    serverId: string,
    name: string,
    dockerFilePath: string,
    options?: ExecutionOptions
  ) => {
    const dockerComposeCommand: Command = {
      command: "docker compose",
      sudo: false,
      args: ["-f", dockerFilePath, "up", "-d"]
    };

    return this.actionService.executeCommandAction(
      organizationId,
      serverId,
      [`echo "Running ${name}..."`, dockerComposeCommand],
      ActionType.RUN_COMPOSE_FILE,
      options
    );
  };

  public restart = (
    organizationId: string,
    serverId: string,
    name: string,
    dockerFilePath: string,
    options?: ExecutionOptions
  ) => {
    const dockerComposeCommand: Command = {
      command: "docker compose",
      sudo: false,
      args: ["-f", dockerFilePath, "restart"]
    };

    return this.actionService.executeCommandAction(
      organizationId,
      serverId,
      [`echo "Restarting ${name}..."`, dockerComposeCommand],
      ActionType.RESTART_COMPOSE_FILE,
      options
    );
  };

  public stop = (
    organizationId: string,
    serverId: string,
    name: string,
    composeFilePath: string | null | undefined,
    timeoutSeconds: number,
    options?: ExecutionOptions
  ) => {
    if (composeFilePath === null || composeFilePath === undefined)
      throw new NotFoundError("Path for compose file was not found!");

    const dockerComposeCommand: Command = {
      command: "docker compose",
      sudo: false,
      args: ["-f", composeFilePath, "down", "-t", timeoutSeconds]
    };

    return this.actionService.executeCommandAction(
      organizationId,
      serverId,
      [`echo "Stopping ${name}..."`, dockerComposeCommand],
      ActionType.STOP_COMPOSE_FILE,
      options
    );
  };

  public queryStats = async (
    organizationId: string,
    serverId: string,
    containerNames: string[],
    options?: ExecutionOptions
  ): Promise<Record<string, ContainerStats>> => {
    const stats = {} as Record<string, ContainerStats>;
    for (const containerName of containerNames) {
      const queryCommand: Command = {
        command: `docker`,
        args: ["stats", "--no-stream", "--format=json", `${containerNames}`],
        converters: [
          async (server, result) => {
            if (result.stderr.includes("Error response from daemon: No such container:"))
              result.stderr = `Container ${containerNames} could not be found!`;
          }
        ]
      };
      const commandResult = await this.actionService.executeCommandAction(
        organizationId,
        serverId,
        [queryCommand],
        ActionType.QUERY_CONTAINER_STATS,
        {
          ...options,
          async: false
        }
      );

      const result: Result | undefined = commandResult.results?.get(queryCommand);
      if (!result || !result.success)
        throw new NotFoundError(`Container stats for ${containerName} could not be queried!`);

      try {
        const containerStats: DockerContainerStats = JSON.parse(result.stdout);
        stats[containerName] = {
          memory_usage: containerStats.MemUsage,
          memory_percentage: containerStats.MemPerc,
          cpu_percentage: containerStats.CPUPerc,
          network_io: containerStats.NetIO
        };
      } catch (e) {
        throw new InternalServerError(
          `Container stats for ${containerName} could not be queried! Error ${
            e instanceof Error ? e.message : e
          }`
        );
      }
    }
    return stats;
  };

  public queryLogs = async (
    organizationId: string,
    serverId: string,
    containerName: string,
    timeframe?: Timeframe,
    options?: ExecutionOptions
  ): Promise<Result> => {
    const queryCommand: Command = {
      command: `docker logs`,
      args: [
        "-t",
        timeframe?.since && timeframe.until
          ? `--since ${timeframe.since} --until ${timeframe.until}`
          : "",
        containerName
      ],
      converters: [
        async (server, result) => {
          if (result.stderr.includes("Error response from daemon: No such container:"))
            result.stderr = `Container ${containerName} could not be found!`;
        }
      ]
    };
    const commandResult = await this.actionService.executeCommandAction(
      organizationId,
      serverId,
      [queryCommand],
      ActionType.QUERY_CONTAINER_LOGS,
      {
        ...options,
        async: false
      }
    );
    const result = commandResult.results.get(queryCommand);
    if (!result || !result.success)
      throw new InternalServerError(`Container logs for ${containerName} could not be queried!`);
    return result;
  };

  public createNetwork = async (
    organizationId: string,
    serverId: string,
    name: string,
    options?: ExecutionOptions
  ): Promise<ActionResult> => {
    const dockerNetworkCommand: Command = {
      command: "docker network",
      sudo: false,
      args: ["create", name]
    };

    return await this.actionService.executeCommandAction(
      organizationId,
      serverId,
      [`echo "Starting network ${name}"`, dockerNetworkCommand],
      ActionType.CREATE_NETWORK,
      options
    );
  };

  public removeNetwork = async (
    organizationId: string,
    serverId: string,
    name: string,
    options?: ExecutionOptions
  ): Promise<CommandActionResult> => {
    const dockerNetworkCommand: Command = {
      command: "docker network",
      sudo: false,
      args: ["rm", name]
    };

    return await this.actionService.executeCommandAction(
      organizationId,
      serverId,
      [`echo "Removing network ${name}..."`, dockerNetworkCommand],
      ActionType.REMOVE_NETWORK,
      options
    );
  };
}
