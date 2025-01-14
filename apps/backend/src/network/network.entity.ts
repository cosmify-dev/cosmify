import { Column, Entity, ManyToMany, ManyToOne, type Relation } from "typeorm";
import { Server } from "../server/index.js";
import { Container } from "../container/container.entity.js";
import { CosmifyEntity } from "../utils/index.js";

@Entity("networks")
export class Network extends CosmifyEntity {
  @Column("text")
  name!: string;

  @Column("bool", {
    default: false
  })
  default!: boolean;

  @ManyToOne(() => Server, (server) => server.networks, {
    onDelete: "CASCADE"
  })
  server!: Relation<Server>;

  @ManyToMany(() => Container, (container) => container.networks, {
    onDelete: "CASCADE"
  })
  fluxes: Relation<Container>[];
}
