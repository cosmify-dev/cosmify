import { Expose, Transform, Type } from "class-transformer";
import {
  IsAlphanumeric,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested
} from "class-validator";
import xss from "xss";
import { CreateContainerDto } from "../container/container.validation.js";
import { validateInt } from "../utils/utils.js";

export class CreateFluxDTO {
  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @Transform(({ value }) => xss(value), { toClassOnly: true })
  @IsNotEmpty()
  @IsAlphanumeric()
  @MaxLength(256)
  name: string;

  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @IsUUID("4")
  server: string;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => CreateContainerDto)
  containers: CreateContainerDto[];
}

export class UpdateFluxDto {
  @Transform(({ value }) => xss(value), { toClassOnly: true })
  @IsNotEmpty()
  @IsAlphanumeric()
  @MaxLength(256)
  name: string;

  @Expose()
  @Transform(({ value }) => validateInt(value))
  @IsNumber(
    {},
    {
      message: "Timeout must be a number"
    }
  )
  @Min(0, {
    message: "Timeout must be greater than or equal to $constraint1"
  })
  shutdownTimeout: number;
}
