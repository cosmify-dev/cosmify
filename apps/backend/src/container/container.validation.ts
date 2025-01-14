import { Expose, Transform, Type } from "class-transformer";
import {
  IsAlphanumeric,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested
} from "class-validator";
import xss from "xss";
import { CreatePortDto } from "../port/port.validation.js";
import { CreateVolumeDto } from "../volumes/volume.validation.js";

export class CreateContainerDto {
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
  @Transform(({ value }) => xss(value), { toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  image: string;

  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  networks: string[];

  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  command: string[];

  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @IsArray()
  @IsString({ each: true })
  labels: string[];

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => CreatePortDto)
  ports: CreatePortDto[] = [];

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => CreateVolumeDto)
  volumes: CreateVolumeDto[] = [];
}
