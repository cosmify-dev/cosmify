import { Column, Entity, OneToMany, type Relation } from "typeorm";
import { Action, TransactionStatus } from "../actions/index.js";
import { CosmifyEntity } from "../utils/index.js";

@Entity("transactions")
export class Transaction extends CosmifyEntity {
  @Column("text")
  type: TransactionType;

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING
  })
  status: TransactionStatus;

  @OneToMany(() => Action, (action) => action.transaction, {
    onDelete: "CASCADE"
  })
  actions: Relation<Action>[];
}

export type TransactionType = "server_validation" | "run_flux" | "remove_flux" | "refresh_flux";
