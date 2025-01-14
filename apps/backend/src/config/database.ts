import { DataSource } from "typeorm";
import { injectable } from "inversify";
import { config } from "./config.js";

export interface IDatabase {
  init(): Promise<DataSource>;
  getDataSource(): DataSource;
  close(): Promise<void>;
}

@injectable()
export class PostgresDataSource implements IDatabase {
  private dataSource: DataSource;

  async init(): Promise<DataSource> {
    this.dataSource = new DataSource({
      type: "postgres",
      host: config.DATABASE.HOST,
      port: config.DATABASE.PORT,
      username: config.DATABASE.USERNAME,
      password: config.DATABASE.PASSWORD,
      database: config.DATABASE.NAME,
      entities: ["dist/**/*.entity.js"],
      migrations: ["dist/migrations/*.js"],
      migrationsTableName: "migrations"
    });
    return await this.dataSource.initialize();
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  async close(): Promise<void> {
    return await this.dataSource.destroy();
  }
}
