import { DataSource } from "typeorm";

export default new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "admin",
  password: "admin",
  database: "cosmify",
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/migrations/*.ts"],
  migrationsTableName: "migrations"
});
