import { inject, injectable } from "inversify";
import { NotFoundError } from "../utils/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { TYPES } from "../TYPES.js";
import { Environment } from "./environment.entity.js";
import { CreateEnvironmentDto } from "./environment.validation.js";
import { type IEnvironmentRepository } from "./environment.repository.js";

export interface IEnvironmentService {
  findAllByProject(
    organizationId: string,
    projectId: string,
    pagination?: Pagination
  ): Promise<PaginationResult<Environment>>;
  findOneById(organizationId: string, id: string): Promise<Environment>;
  save(organizationId: string, projectId: string, dto: CreateEnvironmentDto): Promise<Environment>;
  update(organizationId: string, id: string, flux: Partial<Environment>): Promise<Environment>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class EnvironmentService implements IEnvironmentService {
  constructor(
    @inject(TYPES.EnvironmentRepository)
    private readonly environmentRepository: IEnvironmentRepository
  ) {}

  public findAllByProject = async (
    organizationId: string,
    projectId: string,
    pagination?: Pagination
  ): Promise<PaginationResult<Environment>> => {
    return await this.environmentRepository.findAllByProject(organizationId, projectId, pagination);
  };

  public findOneById = async (organizationId: string, id: string): Promise<Environment> => {
    const environment: Environment | null = await this.environmentRepository.findOneById(
      organizationId,
      id
    );
    if (!environment) throw new NotFoundError(`Environment with id ${id} not found!`);
    return environment;
  };

  public save = async (
    organizationId: string,
    projectId: string,
    dto: CreateEnvironmentDto
  ): Promise<Environment> => {
    return await this.environmentRepository.save(organizationId, projectId, dto);
  };

  public update = async (
    organizationId: string,
    id: string,
    dto: Partial<Environment>
  ): Promise<Environment> => {
    await this.environmentRepository.updatePartial(organizationId, id, dto);
    return await this.findOneById(organizationId, id);
  };

  public delete = async (organizationId: string, id: string): Promise<void> => {
    const environment: Environment | null = await this.environmentRepository.findOneById(
      organizationId,
      id
    );
    if (!environment) throw new NotFoundError(`Environment with id ${id} not found!`);
    await this.environmentRepository.delete(organizationId, id);
  };
}
