import { Expose, Transform, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsAlphanumeric,
  IsAscii,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MaxLength,
  ValidateNested
} from "class-validator";
import xss from "xss";
import { CreateEnvironmentDto } from "../environment/index.js";

export class CreateProjectDto {
  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @Transform(({ value }) => xss(value), { toClassOnly: true })
  @IsNotEmpty()
  @IsAscii()
  @MaxLength(256)
  name: string;

  @IsOptional()
  @Expose()
  @Transform(({ value }) => xss(value), { toClassOnly: true })
  @IsUrl()
  @MaxLength(256)
  logoUrl?: string;

  @Expose()
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => CreateEnvironmentDto)
  environments: CreateEnvironmentDto[];
}

export class UpdateProjectDto {
  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @Transform(({ value }) => xss(value), { toClassOnly: true })
  @IsNotEmpty()
  @IsAlphanumeric()
  @MaxLength(256)
  name?: string;

  @IsOptional()
  @Transform(({ value }) => xss(value), { toClassOnly: true })
  @IsUrl()
  @MaxLength(256)
  logoUrl?: string;
}
