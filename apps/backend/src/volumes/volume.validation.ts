import { Expose, Transform } from "class-transformer";
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateIf
} from "class-validator";
import xss from "xss";
import { type FileType } from "./volume.entity.js";

export class CreateVolumeDto {
  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @Transform(({ value }) => xss(value), { toClassOnly: true })
  @IsNotEmpty()
  @IsString()
  hostPath: string;

  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @IsBoolean()
  create: boolean;

  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @ValidateIf((volumeDto) => volumeDto.create)
  @Transform((value) => parseInt(value.value))
  @IsInt()
  @Min(0)
  @Max(777)
  permission: number;

  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @ValidateIf((volumeDto) => volumeDto.create)
  @IsString()
  @IsEnum(["file", "directory"])
  type: FileType;

  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @Transform(({ value }) => xss(value), { toClassOnly: true })
  @IsNotEmpty()
  @IsString()
  containerPath: string;

  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @IsBoolean()
  readonly: boolean;
}
