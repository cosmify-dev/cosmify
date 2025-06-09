import { inject, injectable } from "inversify";
import { Repository, UpdateResult } from "typeorm";
import { type IDatabase } from "../config/index.js";
import { CommandLog, CommandLogDTO } from "./insight.entity.js";
import { TYPES } from "../TYPES.js";

export interface IInsightRepository {
  findCommandLogById(organizationId: string, id: string): Promise<CommandLog | null>;
  saveCommandLog(organizationId: string, dto: CommandLogDTO): Promise<CommandLog>;
  updateCommandLog(
    organizationId: string,
    id: string,
    dto: Partial<CommandLogDTO>
  ): Promise<number>;
  deleteCommandLog(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class PostgresInsightRepository implements IInsightRepository {
  private repository: Repository<CommandLog>;

  constructor(@inject(TYPES.Database) database: IDatabase) {
    this.repository = database.getDataSource().getRepository(CommandLog);
  }

  public findCommandLogById = async (
    organizationId: string,
    id: string
  ): Promise<CommandLog | null> => {
    return this.repository.findOne({
      where: {
        id: id,
        organization: { id: organizationId }
      }
    });
  };

  public saveCommandLog = async (
    organizationId: string,
    dto: CommandLogDTO
  ): Promise<CommandLog> => {
    const commandLog: CommandLog = this.repository.create({
      ...dto,
      organization: {
        id: organizationId
      }
    });
    await this.repository.insert(commandLog);
    return commandLog;
  };

  public updateCommandLog = async (
    organizationId: string,
    id: string,
    dto: Partial<CommandLogDTO>
  ): Promise<number> => {
    const updateResult: UpdateResult = await this.repository.update(
      { id: id, organization: { id: organizationId } },
      dto
    );
    return updateResult.affected ?? 0;
  };

  public deleteCommandLog = async (organizationId: string, id: string): Promise<void> => {
    await this.repository.delete({
      id: id,
      organization: {
        id: organizationId
      }
    });
  };
}
