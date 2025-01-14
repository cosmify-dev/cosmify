import { Entity, PrimaryColumn } from "typeorm";

@Entity("organization")
export class Organization {
  @PrimaryColumn({
    type: "text"
  })
  id: string;
}
