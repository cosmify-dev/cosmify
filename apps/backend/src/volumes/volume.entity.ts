import { Column, Entity, ManyToOne, type Relation } from "typeorm";
import { Container } from "../container/container.entity.js";
import { CosmifyEntity } from "../utils/index.js";

@Entity("volumes")
export class Volume extends CosmifyEntity {
  @Column({
    type: "text"
  })
  hostPath!: string;

  @Column("int")
  permission!: number;

  @Column({
    type: "bool"
  })
  create: boolean;

  @Column("text")
  type: FileType;

  @Column({
    type: "text"
  })
  containerPath!: string;

  @Column({
    type: "bool"
  })
  readonly!: boolean;

  @ManyToOne(() => Container, (container) => container.volumes, {
    onDelete: "CASCADE"
  })
  container: Relation<Container>;
}

export type FileType = "file" | "directory";
