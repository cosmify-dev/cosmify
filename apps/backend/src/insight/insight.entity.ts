import { Column, Entity, ManyToOne, type Relation } from "typeorm";
import { Server } from "../server/index.js";
import { Action, Status } from "../actions/index.js";
import { CosmifyEntity } from "../utils/index.js";

@Entity("command_logs")
export class CommandLog extends CosmifyEntity {
  @Column({
    type: "text",
    nullable: true
  })
  command?: string;

  @Column({
    type: "text",
    nullable: true
  })
  stdout?: string = "";

  @Column({
    type: "text",
    nullable: true
  })
  stderr?: string = "";

  @Column({
    type: "enum",
    enum: Status
  })
  status: Status;

  @ManyToOne(() => Server, (server) => server.commandLogs, {
    onDelete: "CASCADE"
  })
  server!: Relation<Server>;

  @ManyToOne(() => Action, (action) => action.commandLogs, {
    onDelete: "CASCADE"
  })
  action!: Relation<Action>;
}

export type CommandLogDTO = Omit<
  CommandLog,
  "id" | "createdAt" | "organization" | "organizationId"
>;
