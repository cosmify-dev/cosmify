import { Column, Entity, ManyToOne, type Relation } from "typeorm";
import { Container } from "../container/container.entity.js";
import { CosmifyEntity } from "../utils/index.js";

@Entity("ports")
export class Port extends CosmifyEntity {
  @Column("int")
  hostPort!: number;

  @Column("int")
  containerPort!: number;

  @ManyToOne(() => Container, (container) => container.ports, {
    onDelete: "CASCADE"
  })
  container!: Relation<Container>;
}
