import { inject, injectable } from "inversify";
import { FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { type IDatabase } from "../config/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { TYPES } from "../TYPES.js";
import { Project } from "./project.entity.js";
import { CreateProjectDto } from "./project.validation.js";

export interface IProjectRepository {
  findAll(organizationId: string, pagination?: Pagination): Promise<PaginationResult<Project>>;
  findOneById(organizationId: string, id: string): Promise<Project | null>;
  findOneBy(organizationId: string, where: FindOptionsWhere<Project>): Promise<Project | null>;
  save(organizationId: string, dto: CreateProjectDto): Promise<Project>;
  updatePartial(organizationId: string, id: string, projectDto: Partial<Project>): Promise<number>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class PostgresProjectRepository implements IProjectRepository {
  private repository: Repository<Project>;

  constructor(@inject(TYPES.Database) database: IDatabase) {
    this.repository = database.getDataSource().getRepository(Project);
  }

  public findAll = async (
    organizationId: string,
    pagination: Pagination = new Pagination()
  ): Promise<PaginationResult<Project>> => {
    const result = await this.repository.findAndCount({
      skip: pagination.skip,
      take: pagination.take,
      where: {
        organization: {
          id: organizationId
        }
      },
      order: {
        createdAt: "DESC"
      },
      relations: ["environments"]
    });
    return {
      data: result[0],
      total: result[1],
      ...pagination
    };
  };

  public findOneById = async (organizationId: string, id: string): Promise<Project | null> => {
    return this.repository.findOne({
      where: { id: id, organization: { id: organizationId } },
      relations: ["environments"]
    });
  };

  public findOneBy = async (
    organizationId: string,
    where: FindOptionsWhere<Project>
  ): Promise<Project | null> => {
    return this.repository.findOneBy({
      ...where,
      organization: {
        id: organizationId
      }
    });
  };

  public save = async (organizationId: string, dto: CreateProjectDto): Promise<Project> => {
    const project: Project = this.repository.create({
      organization: {
        id: organizationId
      },
      ...dto
    });
    await this.repository.save(project);
    return project;
  };

  public updatePartial = async (
    organizationId: string,
    id: string,
    dto: Partial<Project>
  ): Promise<number> => {
    const updateResult: UpdateResult = await this.repository.update(
      { id: id, organization: { id: organizationId } },
      dto
    );
    return updateResult.affected ?? 0;
  };

  public delete = async (organizationId: string, id: string): Promise<void> => {
    await this.repository.delete({
      id: id,
      organization: {
        id: organizationId
      }
    });
  };
}
