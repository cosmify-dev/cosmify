import { Column, Entity, ManyToOne, type Relation } from "typeorm";
import { Project } from "../project/index.js";
import { CosmifyEntity } from "../utils/index.js";

@Entity("environments")
export class Environment extends CosmifyEntity {
  @Column("text")
  name!: string;

  @ManyToOne(() => Project, (project) => project.environments, {
    onDelete: "CASCADE"
  })
  project!: Relation<Project>;
}
