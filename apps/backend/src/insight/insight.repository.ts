import { inject, injectable } from "inversify";
import { Repository } from "typeorm";
import { type IDatabase } from "../config/index.js";
import { CommandLog, CommandLogDTO } from "./insight.entity.js";
import { TYPES } from "../TYPES.js";

export interface IInsightRepository {
  saveCommandLog(organizationId: string, dto: CommandLogDTO): Promise<CommandLog>;
  deleteCommandLog(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class PostgresInsightRepository implements IInsightRepository {
  private repository: Repository<CommandLog>;

  constructor(@inject(TYPES.Database) database: IDatabase) {
    this.repository = database.getDataSource().getRepository(CommandLog);
  }

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

  public deleteCommandLog = async (organizationId: string, id: string): Promise<void> => {
    await this.repository.delete({
      id: id,
      organization: {
        id: organizationId
      }
    });
  };
}
