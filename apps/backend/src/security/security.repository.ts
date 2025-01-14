import { inject, injectable } from "inversify";
import { ConflictError, Errors } from "../utils/index.js";
import { PrivateKey } from "./privatekey.entity.js";
import { Repository } from "typeorm";
import { type IDatabase } from "../config/database.js";
import { Pagination } from "../validations/pagination.validation.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { TYPES } from "../TYPES.js";

export interface ISecurityRepository {
  findAll(organizationId: string, pagination?: Pagination): Promise<PaginationResult<PrivateKey>>;
  findById(organizationId: string, id: string): Promise<PrivateKey | null>;
  findByServerId(organizationId: string, serverId: string): Promise<PrivateKey | null>;
  save(organizationId: string, name: string, data: string): Promise<PrivateKey>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class PostgresSecurityRepository implements ISecurityRepository {
  private repository: Repository<PrivateKey>;

  constructor(@inject(TYPES.Database) database: IDatabase) {
    this.repository = database.getDataSource().getRepository(PrivateKey);
  }

  public findAll = async (
    organizationId: string,
    pagination: Pagination = new Pagination()
  ): Promise<PaginationResult<PrivateKey>> => {
    const result = await this.repository.findAndCount({
      take: pagination.take,
      skip: pagination.skip,
      where: {
        organization: {
          id: organizationId
        }
      }
    });
    return {
      data: result[0],
      total: result[1],
      ...pagination
    };
  };

  public findById = async (organizationId: string, id: string): Promise<PrivateKey | null> => {
    return await this.repository.findOneBy({ id: id, organization: { id: organizationId } });
  };

  public findByServerId = async (
    organizationId: string,
    serverId: string
  ): Promise<PrivateKey | null> => {
    return await this.repository.findOneBy({
      servers: { id: serverId },
      organization: { id: organizationId }
    });
  };

  public save = async (organizationId: string, name: string, data: string): Promise<PrivateKey> => {
    if (await this.repository.existsBy({ name: name, organization: { id: organizationId } }))
      throw new ConflictError(
        "Private key with this name already exists",
        Errors.PRIVATE_KEY_MUST_BE_UNIQUE
      );
    const privateKey: PrivateKey = this.repository.create({
      organization: { id: organizationId },
      name,
      data
    });
    await this.repository.insert(privateKey);
    return privateKey;
  };

  public delete = async (organizationId: string, id: string): Promise<void> => {
    await this.repository.delete({
      id,
      organization: {
        id: organizationId
      }
    });
  };
}
