import { inject, injectable } from "inversify";
import { Repository, UpdateResult } from "typeorm";
import { type IDatabase } from "../config/index.js";
import { Action, CreateActionDTO } from "./actions.entity.js";
import { Pagination } from "../validations/pagination.validation.js";
import { TYPES } from "../TYPES.js";

export interface IActionRepository {
  findAll(
    organizationId: string,
    serverId: string,
    pagination?: Pagination
  ): Promise<[Action[], number]>;
  findOneById(organizationId: string, id: string): Promise<Action | null>;
  findByFlux(
    organizationId: string,
    id: string,
    pagination?: Pagination
  ): Promise<[Action[], number]>;
  save(organizationId: string, dto: CreateActionDTO): Promise<Action>;
  updatePartial(organizationId: string, id: string, actionDto: Partial<Action>): Promise<number>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class PostgresActionRepository implements IActionRepository {
  private repository: Repository<Action>;

  constructor(@inject(TYPES.Database) database: IDatabase) {
    this.repository = database.getDataSource().getRepository(Action);
  }

  public findAll = async (
    organizationId: string,
    serverId: string,
    pagination: Pagination = new Pagination()
  ): Promise<[Action[], number]> => {
    return this.repository.findAndCount({
      where: {
        organization: {
          id: organizationId
        },
        server: {
          id: serverId
        }
      },
      relations: ["commandLogs"],
      skip: pagination.skip,
      take: pagination.take,
      order: {
        createdAt: "DESC"
      }
    });
  };

  public findByFlux = async (
    organizationId: string,
    id: string,
    pagination: Pagination = new Pagination()
  ): Promise<[Action[], number]> => {
    return this.repository.findAndCount({
      where: {
        organization: {
          id: organizationId
        },
        flux: {
          id: id
        }
      },
      relations: ["commandLogs"],
      skip: pagination.skip,
      take: pagination.take,
      order: {
        createdAt: "DESC"
      }
    });
  };

  public findOneById = async (organizationId: string, id: string): Promise<Action | null> => {
    return this.repository.findOne({
      where: {
        id: id,
        organization: {
          id: organizationId
        }
      },
      relations: ["commandLogs"]
    });
  };

  public save = async (organizationId: string, dto: CreateActionDTO): Promise<Action> => {
    const action: Action = this.repository.create({
      ...dto,
      organization: {
        id: organizationId
      }
    });

    await this.repository.insert(action);
    return action;
  };

  public updatePartial = async (
    organizationId: string,
    id: string,
    actionDto: Partial<Action>
  ): Promise<number> => {
    const updateResult: UpdateResult = await this.repository.update(
      {
        id: id,
        organization: {
          id: organizationId
        }
      },
      actionDto
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
