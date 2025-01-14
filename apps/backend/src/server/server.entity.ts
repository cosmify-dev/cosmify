import { Column, Entity, ManyToOne, OneToMany, Unique, type Relation } from "typeorm";
import { PrivateKey } from "../security/index.js";
import { Action, Status } from "../actions/index.js";
import { CommandLog } from "../insight/index.js";
import { Flux } from "../fluxor/index.js";
import { Network } from "../network/index.js";
import { CosmifyEntity } from "../utils/index.js";

@Entity("servers")
@Unique(["organization", "name"])
@Unique(["organization", "ip"])
export class Server extends CosmifyEntity {
  @Column("text")
  name!: string;

  @Column("text")
  description!: string;

  @Column("inet")
  ip!: string;

  @Column("int")
  port!: number;

  @Column("text")
  user!: string;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.PENDING
  })
  status: Status;

  @ManyToOne(() => PrivateKey, (privateKey) => privateKey.servers, {
    onDelete: "SET NULL"
  })
  privateKey?: Relation<PrivateKey>;

  @OneToMany(() => Action, (action) => action.server, {
    onDelete: "CASCADE"
  })
  actions?: Relation<Action>[];

  @OneToMany(() => Flux, (flux) => flux.server, {
    onDelete: "CASCADE"
  })
  fluxes?: Flux[];

  @OneToMany(() => Network, (network) => network.server, {
    onDelete: "CASCADE"
  })
  networks?: Relation<Network>[];

  @OneToMany(() => CommandLog, (commandLog) => commandLog.action, {
    onDelete: "CASCADE"
  })
  commandLogs?: Relation<CommandLog>[];

  @Column({
    type: "text",
    nullable: true
  })
  prettyOs?: string;

  @Column({
    type: "text",
    nullable: true
  })
  osId?: string;
}
