import { inject, injectable } from "inversify";
import { ConflictError, NotFoundError } from "../utils/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { TYPES } from "../TYPES.js";
import { type IProjectRepository } from "./project.repository.js";
import { Project } from "./project.entity.js";
import { CreateProjectDto } from "./project.validation.js";
import { type IEnvironmentService } from "../environment/index.js";

export interface IProjectService {
  findAll(organizationId: string, pagination?: Pagination): Promise<PaginationResult<Project>>;
  findOneById(organizationId: string, id: string): Promise<Project>;
  save(organizationId: string, dto: CreateProjectDto): Promise<Project>;
  update(organizationId: string, id: string, flux: Partial<Project>): Promise<Project>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class ProjectService implements IProjectService {
  constructor(
    @inject(TYPES.ProjectRepository)
    private readonly projectRepository: IProjectRepository,
    @inject(TYPES.EnvironmentService)
    private readonly environmentService: IEnvironmentService
  ) {}

  public findAll = async (
    organizationId: string,
    pagination?: Pagination
  ): Promise<PaginationResult<Project>> => {
    return await this.projectRepository.findAll(organizationId, pagination);
  };

  public findOneById = async (organizationId: string, id: string): Promise<Project> => {
    const project: Project | null = await this.projectRepository.findOneById(organizationId, id);
    if (!project) throw new NotFoundError(`Project with id ${id} not found!`);
    return project;
  };

  public save = async (organizationId: string, dto: CreateProjectDto): Promise<Project> => {
    const projectWithName = await this.projectRepository.findOneBy(organizationId, {
      name: dto.name
    });
    if (projectWithName)
      throw new ConflictError(`Project with name ${dto.name} is already created!`);

    const project = await this.projectRepository.save(organizationId, dto);

    for (const environmentDto of dto.environments)
      await this.environmentService.save(organizationId, project.id, environmentDto);

    return this.findOneById(organizationId, project.id);
  };

  public update = async (
    organizationId: string,
    id: string,
    dto: Partial<Project>
  ): Promise<Project> => {
    await this.projectRepository.updatePartial(organizationId, id, dto);
    return await this.findOneById(organizationId, id);
  };

  public delete = async (organizationId: string, id: string): Promise<void> => {
    const project: Project | null = await this.projectRepository.findOneById(organizationId, id);
    if (!project) throw new NotFoundError(`Project with id ${id} not found!`);
    await this.projectRepository.delete(organizationId, id);
  };
}
