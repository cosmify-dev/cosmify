import { inject, injectable } from "inversify";
import { ConflictError, NotFoundError } from "../utils/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { Flux } from "./flux.entity.js";
import { type IFluxorRepository } from "./fluxor.repository.js";
import { CreateFluxDTO } from "./flux.validation.js";
import { type IServerRepository, Server } from "../server/index.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { Status } from "../actions/index.js";
import { TYPES } from "../TYPES.js";
import { type IContainerService } from "../container/container.service.js";

export interface IFluxorService {
  findAll(organizationId: string, pagination?: Pagination): Promise<PaginationResult<Flux>>;
  findOneById(organizationId: string, id: string): Promise<Flux>;
  save(organizationId: string, dto: CreateFluxDTO): Promise<Flux>;
  update(organizationId: string, id: string, flux: Partial<Flux>): Promise<Flux>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class FluxorService implements IFluxorService {
  constructor(
    @inject(TYPES.FluxorRepository)
    private readonly fluxorRepository: IFluxorRepository,
    @inject(TYPES.ServerRepository)
    private readonly serverRepository: IServerRepository,
    @inject(TYPES.ContainerService)
    private readonly containerService: IContainerService
  ) {}

  public findAll = async (
    organizationId: string,
    pagination?: Pagination
  ): Promise<PaginationResult<Flux>> => {
    return await this.fluxorRepository.findAll(organizationId, pagination);
  };

  public findOneById = async (organizationId: string, id: string): Promise<Flux> => {
    const flux: Flux | null = await this.fluxorRepository.findOneById(organizationId, id);
    if (!flux) throw new NotFoundError("Flux not found");
    return flux;
  };

  public save = async (organizationId: string, dto: CreateFluxDTO): Promise<Flux> => {
    const server: Server | null = await this.serverRepository.findOneByID(
      organizationId,
      dto.server
    );
    if (!server) throw new NotFoundError(`Server ${dto.server} not found`);
    if (server.status === Status.DELETING)
      throw new ConflictError(`Server ${server.name} is deleting!`);

    const doesFluxAlreadyExists: boolean =
      (await this.fluxorRepository.findOneBy(organizationId, {
        name: dto.name,
        server: {
          id: dto.server
        }
      })) !== null;
    if (doesFluxAlreadyExists)
      throw new ConflictError(`Flux with name ${dto.name} already runs on server ${server.name}`);

    const flux = await this.fluxorRepository.save(organizationId, dto.name, server);

    for (const container of dto.containers)
      await this.containerService.save(organizationId, flux.id, container);

    return flux;
  };

  public update = async (
    organizationId: string,
    id: string,
    flux: Partial<Flux>
  ): Promise<Flux> => {
    await this.fluxorRepository.updatePartial(organizationId, id, flux);
    return await this.findOneById(organizationId, id);
  };

  public delete = async (organizationId: string, id: string): Promise<void> => {
    const flux: Flux | null = await this.fluxorRepository.findOneById(organizationId, id);
    if (!flux) throw new NotFoundError(`Flux with id ${id} not found!`);
    await this.fluxorRepository.delete(organizationId, id);
  };
}
