import { Column, Entity, OneToMany, Unique, type Relation } from "typeorm";
import { Environment } from "../environment/index.js";
import { CosmifyEntity } from "../utils/index.js";

@Entity("projects")
@Unique(["organization", "name"])
export class Project extends CosmifyEntity {
  @Column("text")
  name!: string;

  @Column({
    type: "text",
    nullable: true
  })
  logoUrl?: string;

  @OneToMany(() => Environment, (environment) => environment.project, {
    onDelete: "CASCADE"
  })
  environments!: Relation<Environment>[];
}
