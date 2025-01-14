import { Expose, Transform } from "class-transformer";
import {
  IsAlphanumeric,
  IsDefined,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength
} from "class-validator";
import { validateXss } from "../utils/utils.js";

export class CreateNetworkDto {
  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @Transform(({ value }) => validateXss(value), { toClassOnly: true })
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @MaxLength(256)
  name: string;

  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @IsUUID("4")
  server: string;
}
