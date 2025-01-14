import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  type Relation
} from "typeorm";
import { Port } from "../port/index.js";
import { Network } from "../network/index.js";
import { Volume } from "../volumes/volume.entity.js";
import { Flux } from "../fluxor/index.js";
import { CosmifyEntity } from "../utils/index.js";

@Entity("containers")
export class Container extends CosmifyEntity {
  @Column("text")
  name!: string;

  @Column("text")
  image!: string;

  @OneToMany(() => Port, (port) => port.container, {
    onDelete: "CASCADE"
  })
  ports: Relation<Port>[];

  @Column("text", {
    array: true
  })
  command!: string[];

  @Column("text", {
    array: true
  })
  labels!: string[];

  @OneToMany(() => Volume, (volume) => volume.container, {
    onDelete: "CASCADE"
  })
  volumes: Relation<Volume>[];

  @ManyToMany(() => Network, (network) => network.fluxes, {
    onDelete: "CASCADE"
  })
  @JoinTable()
  networks: Relation<Network>[];

  @ManyToOne(() => Flux, (flux) => flux.containers, {
    onDelete: "CASCADE"
  })
  flux: Relation<Flux>;
}
