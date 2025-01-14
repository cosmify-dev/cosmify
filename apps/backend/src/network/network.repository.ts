import { inject, injectable } from "inversify";
import { FindOptionsWhere, In, Repository, UpdateResult } from "typeorm";
import { type IDatabase } from "../config/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { Server } from "../server/index.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { Network } from "./network.entity.js";
import { TYPES } from "../TYPES.js";

export interface INetworkRepository {
  findAll(organizationId: string, pagination?: Pagination): Promise<PaginationResult<Network>>;
  findByIds(organizationId: string, ids: string[]): Promise<Network[]>;
  findOneById(organizationId: string, id: string): Promise<Network | null>;
  findOneBy(organizationId: string, where: FindOptionsWhere<Network>): Promise<Network | null>;
  save(organizationId: string, name: string, server: Server, isDefault: boolean): Promise<Network>;
  updatePartial(organizationId: string, id: string, networkDto: Partial<Network>): Promise<number>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class PostgresNetworkRepository implements INetworkRepository {
  private repository: Repository<Network>;

  constructor(@inject(TYPES.Database) database: IDatabase) {
    this.repository = database.getDataSource().getRepository(Network);
  }

  public findAll = async (
    organizationId: string,
    pagination: Pagination = new Pagination()
  ): Promise<PaginationResult<Network>> => {
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
      relations: ["server"]
    });
    return {
      data: result[0],
      total: result[1],
      ...pagination
    };
  };

  public findByIds = async (organizationId: string, ids: string[]): Promise<Network[]> => {
    return this.repository.findBy({ id: In(ids), organization: { id: organizationId } });
  };

  public findOneById = async (organizationId: string, id: string): Promise<Network | null> => {
    return this.repository.findOne({
      where: { id: id, organization: { id: organizationId } },
      relations: ["server"]
    });
  };

  public findOneBy = async (
    organizationId: string,
    where: FindOptionsWhere<Network>
  ): Promise<Network | null> => {
    return this.repository.findOneBy({
      ...where,
      organization: {
        id: organizationId
      }
    });
  };

  public save = async (
    organizationId: string,
    name: string,
    server: Server,
    isDefault = false
  ): Promise<Network> => {
    const network: Network = this.repository.create({
      organization: {
        id: organizationId
      },
      name: name,
      server: server,
      default: isDefault
    });

    await this.repository.insert(network);
    return network;
  };

  public updatePartial = async (
    organizationId: string,
    id: string,
    networkDto: Partial<Network>
  ): Promise<number> => {
    const updateResult: UpdateResult = await this.repository.update(
      { id: id, organization: { id: organizationId } },
      networkDto
    );
    return updateResult.affected ?? 0;
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
