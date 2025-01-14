import { Column, Entity, ManyToOne, OneToMany, type Relation } from "typeorm";
import { Server } from "../server/index.js";
import { Action, Status } from "../actions/index.js";
import { Container } from "../container/container.entity.js";
import { CosmifyEntity } from "../utils/index.js";

@Entity("fluxes")
export class Flux extends CosmifyEntity {
  @Column("text")
  name!: string;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.PENDING
  })
  status?: Status;

  @ManyToOne(() => Server, (server) => server.fluxes, {
    onDelete: "CASCADE"
  })
  server!: Relation<Server>;

  @OneToMany(() => Container, (container) => container.flux, {
    onDelete: "CASCADE"
  })
  containers!: Relation<Container>[];

  @OneToMany(() => Action, (action) => action.flux, {
    onDelete: "CASCADE"
  })
  actions!: Relation<Action>[];

  @Column({
    type: "text",
    nullable: true
  })
  directoryPath: string | null;

  @Column({
    type: "int",
    default: 32
  })
  shutdownTimeout: number;
}
