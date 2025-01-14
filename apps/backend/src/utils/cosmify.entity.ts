import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn
} from "typeorm";
import { Organization } from "../organization/index.js";

export class CosmifyEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Organization, { onDelete: "CASCADE" })
  @JoinColumn({ name: "organizationId" })
  organization: Relation<Organization>;

  @Column({
    type: "string"
  })
  organizationId: string;

  @CreateDateColumn({
    type: "timestamptz"
  })
  createdAt?: Date;

  @UpdateDateColumn({
    type: "timestamptz"
  })
  updatedAt?: Date;
}
