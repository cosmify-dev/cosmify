import { Column, Entity, OneToMany, Unique, type Relation } from "typeorm";
import { Server } from "../server/index.js";
import { CosmifyEntity } from "../utils/index.js";

@Entity("private_keys")
@Unique(["organization", "name"])
export class PrivateKey extends CosmifyEntity {
  @Column("text")
  name!: string;

  @Column({
    type: "text",
    nullable: false
  })
  data: string;

  @OneToMany(() => Server, (server) => server.privateKey)
  servers: Relation<Server>[];
}

export type PrivateKeyDTO = Omit<PrivateKey, "data">;
