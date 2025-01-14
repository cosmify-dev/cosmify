import { inject, injectable } from "inversify";
import { ConflictError, NotFoundError } from "../utils/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { type IServerRepository, Server } from "../server/index.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { Network } from "./network.entity.js";
import { type INetworkRepository } from "./network.repository.js";
import { ActionResult, Status } from "../actions/index.js";
import { ExecutionOptions } from "../utils/types/options.type.js";
import { type IDockerService } from "../docker/docker.service.js";
import { TYPES } from "../TYPES.js";

export interface INetworkService {
  findAll(organizationId: string, pagination?: Pagination): Promise<PaginationResult<Network>>;
  findOneById(organizationId: string, id: string): Promise<Network>;
  findDefaultForServer(organizationId: string, id: string): Promise<Network>;
  save(
    organizationId: string,
    name: string,
    serverId: string,
    isDefault: boolean,
    options?: ExecutionOptions
  ): Promise<
    ActionResult & {
      network: Network;
    }
  >;
  update(organizationId: string, id: string, network: Partial<Network>): Promise<Network>;
  delete(organizationId: string, id: string, force?: boolean): Promise<void>;
}

@injectable()
export class NetworkService implements INetworkService {
  constructor(
    @inject(TYPES.NetworkRepository)
    private readonly networkRepository: INetworkRepository,
    @inject(TYPES.ServerRepository)
    private readonly serverRepository: IServerRepository,
    @inject(TYPES.DockerService)
    private readonly dockerService: IDockerService
  ) {}

  public findAll = async (
    organizationId: string,
    pagination?: Pagination
  ): Promise<PaginationResult<Network>> => {
    return await this.networkRepository.findAll(organizationId, pagination);
  };

  public findOneById = async (organizationId: string, id: string): Promise<Network> => {
    const network = await this.networkRepository.findOneById(organizationId, id);
    if (!network) throw new NotFoundError("Network not found!");
    return network;
  };

  public findDefaultForServer = async (organizationId: string, id: string): Promise<Network> => {
    const network = await this.networkRepository.findOneBy(organizationId, {
      default: true,
      server: {
        id: id
      }
    });
    if (!network) throw new NotFoundError(`Default network for server ${id} not found!`);
    return network;
  };

  public save = async (
    organizationId: string,
    serverId: string,
    name: string,
    isDefault = false,
    options?: ExecutionOptions
  ): Promise<
    ActionResult & {
      network: Network;
    }
  > => {
    const server: Server | null = await this.serverRepository.findOneByID(organizationId, serverId);
    if (!server) throw new NotFoundError(`Server ${serverId} not found`);
    if (server.status === Status.DELETING)
      throw new ConflictError(`Server ${server.name} is deleting!`);
    const doesNetworkAlreadyExists: boolean =
      (await this.networkRepository.findOneBy(organizationId, {
        name: name,
        server: {
          id: serverId
        }
      })) !== null;
    if (doesNetworkAlreadyExists)
      throw new ConflictError(
        `Network with name ${name} already installed on server ${server.name}`
      );
    const network = await this.networkRepository.save(organizationId, name, server, isDefault);
    const actionResult: ActionResult = await this.dockerService.createNetwork(
      organizationId,
      serverId,
      name,
      options
    );
    return {
      ...actionResult,
      network
    };
  };

  public update = async (
    organizationId: string,
    id: string,
    network: Partial<Network>
  ): Promise<Network> => {
    await this.networkRepository.updatePartial(organizationId, id, network);
    return await this.findOneById(organizationId, id);
  };

  public delete = async (organizationId: string, id: string, force = false): Promise<void> => {
    const network: Network | null = await this.networkRepository.findOneById(organizationId, id);
    if (!network) throw new NotFoundError(`Network with ID ${id} not found!`);

    if (network.default && !force)
      throw new ConflictError("Default network should not be deleted!");

    const response = await this.dockerService.removeNetwork(
      organizationId,
      network.server.id,
      network.name,
      {
        async: false
      }
    );

    if (response.status !== Status.SUCCESS) {
      const errorDetails = Array.from(response.results.entries())
        .map(([command, result]) => `${result.stderr}`)
        .join("\n");

      throw new ConflictError(
        `Failed to remove docker network ${network.name}. Details: ${errorDetails}`
      );
    }

    await this.networkRepository.delete(organizationId, id);
  };
}
