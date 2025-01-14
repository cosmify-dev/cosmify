import { inject, injectable } from "inversify";
import { Repository } from "typeorm";
import { type IDatabase } from "../config/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { TYPES } from "../TYPES.js";
import { Container } from "./container.entity.js";
import { Network } from "../network/index.js";

export interface IContainerRepository {
  findAll(organizationId: string, pagination?: Pagination): Promise<PaginationResult<Container>>;
  findOneById(organizationId: string, id: string): Promise<Container | null>;
  save(
    organizationId: string,
    fluxId: string,
    name: string,
    image: string,
    command: string[],
    labels: string[],
    networks: Network[]
  ): Promise<Container>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class PostgresContainerRepository implements IContainerRepository {
  private repository: Repository<Container>;

  constructor(@inject(TYPES.Database) database: IDatabase) {
    this.repository = database.getDataSource().getRepository(Container);
  }

  public findAll = async (
    organizationId: string,
    pagination: Pagination = new Pagination()
  ): Promise<PaginationResult<Container>> => {
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
      relations: ["networks", "volumes"]
    });
    return {
      data: result[0],
      total: result[1],
      ...pagination
    };
  };

  public findOneById = async (organizationId: string, id: string): Promise<Container | null> => {
    return this.repository.findOne({
      where: { id: id, organization: { id: organizationId } },
      relations: ["networks", "volumes"]
    });
  };

  public save = async (
    organizationId: string,
    fluxId: string,
    name: string,
    image: string,
    command: string[],
    labels: string[],
    networks: Network[]
  ): Promise<Container> => {
    const container: Container = this.repository.create({
      organization: {
        id: organizationId
      },
      flux: {
        id: fluxId
      },
      name: name,
      image: image,
      command: command,
      labels: labels,
      networks: networks
    });
    await this.repository.save(container);
    return container;
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
