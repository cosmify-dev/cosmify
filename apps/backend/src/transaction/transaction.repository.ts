import { inject, injectable } from "inversify";
import { FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { type IDatabase } from "../config/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { Transaction, TransactionType } from "./transaction.entity.js";
import { TYPES } from "../TYPES.js";

export interface ITransactionRepository {
  findAll(organizationId: string, pagination?: Pagination): Promise<PaginationResult<Transaction>>;
  findOneById(organizationId: string, id: string): Promise<Transaction | null>;
  findOneBy(
    organizationId: string,
    where: FindOptionsWhere<Transaction>
  ): Promise<Transaction | null>;
  save(organizationId: string, type: TransactionType): Promise<Transaction>;
  updatePartial(organizationId: string, id: string, dto: Partial<Transaction>): Promise<number>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class PostgresTransactionRepository implements ITransactionRepository {
  private repository: Repository<Transaction>;

  constructor(@inject(TYPES.Database) database: IDatabase) {
    this.repository = database.getDataSource().getRepository(Transaction);
  }

  public findAll = async (
    organizationId: string,
    pagination: Pagination = new Pagination()
  ): Promise<PaginationResult<Transaction>> => {
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
      relations: ["actions"]
    });
    return {
      data: result[0],
      total: result[1],
      ...pagination
    };
  };

  public findOneById = async (organizationId: string, id: string): Promise<Transaction | null> => {
    return this.repository.findOne({
      where: {
        id: id,
        organization: {
          id: organizationId
        }
      },
      relations: {
        actions: {
          server: true,
          transaction: true,
          commandLogs: true
        }
      },
      relationLoadStrategy: "join"
    });
  };

  public findOneBy = async (
    organizationId: string,
    where: FindOptionsWhere<Transaction>
  ): Promise<Transaction | null> => {
    return this.repository.findOneBy({
      ...where,
      organization: {
        id: organizationId
      }
    });
  };

  public save = async (organizationId: string, type: TransactionType): Promise<Transaction> => {
    const transaction: Transaction = this.repository.create({
      type: type,
      organization: {
        id: organizationId
      }
    });

    await this.repository.insert(transaction);
    return transaction;
  };

  public updatePartial = async (
    organizationId: string,
    id: string,
    dto: Partial<Transaction>
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
