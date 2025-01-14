import { inject, injectable } from "inversify";
import { ConflictError } from "../utils/index.js";
import { Server } from "./server.entity.js";
import { Repository, UpdateResult } from "typeorm";
import { type IDatabase } from "../config/database.js";
import { PrivateKey } from "../security/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { TYPES } from "../TYPES.js";

export interface IServerRepository {
  findAll(organizationId: string, pagination?: Pagination): Promise<PaginationResult<Server>>;
  findOneByID(organizationId: string, id: string): Promise<Server | null>;
  save(
    organizationId: string,
    name: string,
    description: string,
    ip: string,
    port: number,
    user: string,
    privateKey: PrivateKey
  ): Promise<Server>;
  updatePartial(organizationId: string, id: string, server: Partial<Server>): Promise<number>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class PostgresServerRepository implements IServerRepository {
  private repository: Repository<Server>;

  constructor(@inject(TYPES.Database) database: IDatabase) {
    this.repository = database.getDataSource().getRepository(Server);
  }

  public findAll = async (
    organizationId: string,
    pagination: Pagination = new Pagination()
  ): Promise<PaginationResult<Server>> => {
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
      loadRelationIds: {
        relations: ["privateKey"]
      }
    });
    return {
      data: result[0],
      total: result[1],
      ...pagination
    };
  };

  public findOneByID = async (organizationId: string, id: string): Promise<Server | null> => {
    return await this.repository.findOne({
      where: { id: id, organization: { id: organizationId } },
      loadRelationIds: {
        relations: ["privateKey"]
      }
    });
  };

  public save = async (
    organizationId: string,
    name: string,
    description: string,
    ip: string,
    port: number,
    user: string,
    privateKey: PrivateKey
  ): Promise<Server> => {
    if (
      await this.repository.existsBy({ organization: { id: organizationId }, ip: ip, port: port })
    )
      throw new ConflictError(`Server with ip ${ip} is already registered`);

    if (
      await this.repository.existsBy({
        organization: { id: organizationId },
        name: name,
        port: port
      })
    )
      throw new ConflictError(`Server with name ${name} is already registered`);

    const server: Server = this.repository.create({
      organization: {
        id: organizationId
      },
      name,
      description,
      ip,
      port,
      user,
      privateKey
    });

    await this.repository.insert(server);
    return server;
  };

  public updatePartial = async (
    organizationId: string,
    id: string,
    partialServerDTO: Partial<Server>
  ): Promise<number> => {
    const updateResult: UpdateResult = await this.repository.update(
      { id: id, organization: { id: organizationId } },
      partialServerDTO
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
