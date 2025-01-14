import { inject, injectable } from "inversify";
import { FindOptionsWhere, In, Repository, UpdateResult } from "typeorm";
import { type IDatabase } from "../config/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { FileType, Volume } from "./volume.entity.js";
import { TYPES } from "../TYPES.js";
import { Container } from "../container/container.entity.js";

export interface IVolumeRepository {
  findAll(organizationId: string, pagination?: Pagination): Promise<PaginationResult<Volume>>;
  findByIds(organizationId: string, ids: string[]): Promise<Volume[]>;
  findOneById(organizationId: string, id: string): Promise<Volume | null>;
  findOneBy(organizationId: string, where: FindOptionsWhere<Volume>): Promise<Volume | null>;
  save(
    organizationId: string,
    hostPath: string,
    create: boolean,
    permission: number,
    type: FileType,
    containerPath: string,
    readonly: boolean,
    container: Container
  ): Promise<Volume>;
  updatePartial(organizationId: string, id: string, dto: Partial<Volume>): Promise<number>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class PostgresVolumeRepository implements IVolumeRepository {
  private repository: Repository<Volume>;

  constructor(@inject(TYPES.Database) database: IDatabase) {
    this.repository = database.getDataSource().getRepository(Volume);
  }

  public findAll = async (
    organizationId: string,
    pagination: Pagination = new Pagination()
  ): Promise<PaginationResult<Volume>> => {
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
      relations: ["flux"]
    });
    return {
      data: result[0],
      total: result[1],
      ...pagination
    };
  };

  public findByIds = async (organizationId: string, ids: string[]): Promise<Volume[]> => {
    return this.repository.findBy({
      id: In(ids),
      organization: {
        id: organizationId
      }
    });
  };

  public findOneById = async (organizationId: string, id: string): Promise<Volume | null> => {
    return this.repository.findOne({
      where: {
        id: id,
        organization: {
          id: organizationId
        }
      },
      relations: ["flux"]
    });
  };

  public findOneBy = async (
    organizationId: string,
    where: FindOptionsWhere<Volume>
  ): Promise<Volume | null> => {
    return this.repository.findOneBy({
      ...where,
      organization: {
        id: organizationId
      }
    });
  };

  public save = async (
    organizationId: string,
    hostPath: string,
    create: boolean,
    permission: number,
    type: FileType,
    containerPath: string,
    readonly: boolean,
    container: Container
  ): Promise<Volume> => {
    const volume: Volume = this.repository.create({
      organization: {
        id: organizationId
      },
      hostPath: hostPath,
      create: create,
      type: type,
      permission: permission,
      containerPath: containerPath,
      readonly: readonly,
      container: container
    });

    await this.repository.insert(volume);
    return volume;
  };

  public updatePartial = async (
    organizationId: string,
    id: string,
    dto: Partial<Volume>
  ): Promise<number> => {
    const updateResult: UpdateResult = await this.repository.update(
      {
        id: id,
        organization: {
          id: organizationId
        }
      },
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
