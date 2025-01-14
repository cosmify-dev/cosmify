import { inject, injectable } from "inversify";
import { Repository, UpdateResult } from "typeorm";
import { type IDatabase } from "../config/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { TYPES } from "../TYPES.js";
import { Environment } from "./environment.entity.js";
import { CreateEnvironmentDto } from "./environment.validation.js";

export interface IEnvironmentRepository {
  findAllByProject(
    organizationId: string,
    projectId: string,
    pagination?: Pagination
  ): Promise<PaginationResult<Environment>>;
  findOneById(organizationId: string, id: string): Promise<Environment | null>;
  save(organizationId: string, projectId: string, dto: CreateEnvironmentDto): Promise<Environment>;
  updatePartial(
    organizationId: string,
    id: string,
    projectDto: Partial<Environment>
  ): Promise<number>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class PostgresEnvironmentRepository implements IEnvironmentRepository {
  private repository: Repository<Environment>;

  constructor(@inject(TYPES.Database) database: IDatabase) {
    this.repository = database.getDataSource().getRepository(Environment);
  }

  public findAllByProject = async (
    organizationId: string,
    projectId: string,
    pagination: Pagination = new Pagination()
  ): Promise<PaginationResult<Environment>> => {
    const result = await this.repository.findAndCount({
      skip: pagination.skip,
      take: pagination.take,
      where: {
        organization: {
          id: organizationId
        },
        project: {
          id: projectId
        }
      },
      order: {
        createdAt: "DESC"
      }
    });
    return {
      data: result[0],
      total: result[1],
      ...pagination
    };
  };

  public findOneById = async (organizationId: string, id: string): Promise<Environment | null> => {
    return this.repository.findOne({
      where: { id: id, organization: { id: organizationId } }
    });
  };

  public save = async (
    organizationId: string,
    projectId: string,
    dto: CreateEnvironmentDto
  ): Promise<Environment> => {
    const environment: Environment = this.repository.create({
      organization: {
        id: organizationId
      },
      project: {
        id: projectId
      },
      ...dto
    });
    await this.repository.save(environment);
    return environment;
  };

  public updatePartial = async (
    organizationId: string,
    id: string,
    dto: Partial<Environment>
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
