import { inject, injectable } from "inversify";
import { FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { type IDatabase } from "../config/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { Flux } from "./flux.entity.js";
import { Server } from "../server/index.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { TYPES } from "../TYPES.js";

export interface IFluxorRepository {
  findAll(organizationId: string, pagination?: Pagination): Promise<PaginationResult<Flux>>;
  findOneById(organizationId: string, id: string): Promise<Flux | null>;
  findOneBy(organizationId: string, where: FindOptionsWhere<Flux>): Promise<Flux | null>;
  save(organizationId: string, name: string, server: Server): Promise<Flux>;
  updatePartial(organizationId: string, id: string, fluxDto: Partial<Flux>): Promise<number>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class PostgresFluxorRepository implements IFluxorRepository {
  private repository: Repository<Flux>;

  constructor(@inject(TYPES.Database) database: IDatabase) {
    this.repository = database.getDataSource().getRepository(Flux);
  }

  public findAll = async (
    organizationId: string,
    pagination: Pagination = new Pagination()
  ): Promise<PaginationResult<Flux>> => {
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
      relations: [
        "containers",
        "server",
        "containers.ports",
        "containers.volumes",
        "containers.networks"
      ]
    });
    return {
      data: result[0],
      total: result[1],
      ...pagination
    };
  };

  public findOneById = async (organizationId: string, id: string): Promise<Flux | null> => {
    return this.repository.findOne({
      where: { id: id, organization: { id: organizationId } },
      relations: [
        "containers",
        "server",
        "containers.ports",
        "containers.volumes",
        "containers.networks"
      ]
    });
  };

  public findOneBy = async (
    organizationId: string,
    where: FindOptionsWhere<Flux>
  ): Promise<Flux | null> => {
    return this.repository.findOneBy({
      ...where,
      organization: {
        id: organizationId
      }
    });
  };

  public save = async (organizationId: string, name: string, server: Server): Promise<Flux> => {
    const flux: Flux = this.repository.create({
      organization: {
        id: organizationId
      },
      name: name,
      server: server
    });
    await this.repository.save(flux);
    return flux;
  };

  public updatePartial = async (
    organizationId: string,
    id: string,
    fluxDto: Partial<Flux>
  ): Promise<number> => {
    const updateResult: UpdateResult = await this.repository.update(
      { id: id, organization: { id: organizationId } },
      fluxDto
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
