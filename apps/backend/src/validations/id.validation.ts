import { IsDefined, IsUUID } from "class-validator";
import { Expose } from "class-transformer";

export class ID {
  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @IsUUID("4")
  id!: string;
}
