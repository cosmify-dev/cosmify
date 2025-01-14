import { inject, injectable } from "inversify";
import { NotFoundError, ServerNotFoundError } from "../utils/index.js";
import { type IServerRepository } from "./server.repository.js";
import { Server } from "./server.entity.js";
import { CreateServerDTO } from "./server.validation.js";
import { type ISecurityService, PrivateKey } from "../security/index.js";
import { type IActionService, Status } from "../actions/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { config } from "../config/index.js";
import { type IFluxorService } from "../fluxor/index.js";
import { type INetworkService } from "../network/index.js";
import { TYPES } from "../TYPES.js";

export interface IServerService {
  findAll(organizationId: string, pagination?: Pagination): Promise<PaginationResult<Server>>;
  findServerById(organizationId: string, id: string): Promise<Server>;
  saveServer(organizationId: string, dto: CreateServerDTO): Promise<Server>;
  updateServer(organizationId: string, id: string, server: Partial<Server>): Promise<Server>;
  deleteServer(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class ServerService implements IServerService {
  constructor(
    @inject(TYPES.ServerRepository)
    private readonly serverRepository: IServerRepository,
    @inject(TYPES.FluxorService)
    private readonly fluxorService: IFluxorService,
    @inject(TYPES.NetworkService)
    private readonly networkService: INetworkService,
    @inject(TYPES.SecurityService)
    private readonly securityService: ISecurityService,
    @inject(TYPES.ActionService)
    private readonly actionService: IActionService
  ) {}

  public findAll = async (
    organizationId: string,
    pagination?: Pagination
  ): Promise<PaginationResult<Server>> => {
    return this.serverRepository.findAll(organizationId, pagination);
  };

  public findServerById = async (organizationId: string, id: string): Promise<Server> => {
    const server: Server | null = await this.serverRepository.findOneByID(organizationId, id);
    if (!server) throw new ServerNotFoundError(organizationId, id);
    return server;
  };

  public updateServer = async (
    organizationId: string,
    id: string,
    server: Partial<Server>
  ): Promise<Server> => {
    await this.serverRepository.updatePartial(organizationId, id, server);
    return this.findServerById(organizationId, id);
  };

  public saveServer = async (organizationId: string, dto: CreateServerDTO): Promise<Server> => {
    const privateKey: PrivateKey | null = await this.securityService.findById(
      organizationId,
      dto.privateKey
    );
    if (!privateKey) throw new NotFoundError(`Private key ${dto.privateKey} not found`);
    return await this.serverRepository.save(
      organizationId,
      dto.name,
      dto.description,
      dto.ip,
      dto.port,
      dto.user,
      privateKey
    );
  };

  public deleteServer = async (organizationId: string, id: string): Promise<void> => {
    const server: Server | null = await this.serverRepository.findOneByID(organizationId, id);
    if (!server) throw new ServerNotFoundError(organizationId, id);

    await this.serverRepository.updatePartial(organizationId, id, {
      status: Status.DELETING
    });

    if (server.status !== Status.PENDING) {
      for (const flux of server.fluxes || [])
        await this.fluxorService.delete(organizationId, flux.id);
      for (const network of server.networks || [])
        await this.networkService.delete(organizationId, network.id, true);

      await this.actionService.removeDocker(organizationId, id, {
        async: false
      });
      await this.actionService.removePath(organizationId, id, config.REMOTE_SERVER_CONFIG_PATH, {
        recursive: true,
        sudo: true,
        async: false
      });
    }

    await this.serverRepository.delete(organizationId, id);
  };
}
