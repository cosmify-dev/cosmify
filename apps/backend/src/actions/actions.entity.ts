import { Column, Entity, ManyToOne, OneToMany, type Relation } from "typeorm";
import { Server } from "../server/index.js";
import { ActionType, Status } from "./actions.type.js";
import { CommandLog } from "../insight/index.js";
import { Transaction } from "../transaction/transaction.entity.js";
import { Flux } from "../fluxor/index.js";
import { CosmifyEntity } from "../utils/index.js";

@Entity("actions")
export class Action extends CosmifyEntity {
  @Column({
    type: "enum",
    enum: ActionType
  })
  type!: ActionType;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.PENDING
  })
  status: Status;

  @ManyToOne(() => Server, (server) => server.actions, {
    onDelete: "CASCADE"
  })
  server!: Relation<Server>;

  @ManyToOne(() => Flux, (flux) => flux.actions, {
    onDelete: "CASCADE",
    nullable: true
  })
  flux?: Relation<Flux>;

  @ManyToOne(() => Transaction, (transaction) => transaction.actions, {
    onDelete: "CASCADE",
    nullable: true
  })
  transaction?: Relation<Transaction>;

  @OneToMany(() => CommandLog, (commandLog) => commandLog.action, {
    onDelete: "CASCADE"
  })
  commandLogs: Relation<CommandLog>[];
}

export type CreateActionDTO = Omit<
  Action,
  "id" | "commandLogs" | "createdAt" | "updatedAt" | "organization" | "organizationId"
>;
