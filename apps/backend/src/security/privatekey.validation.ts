import { Expose, Transform } from "class-transformer";
import { IsAlphanumeric, IsDefined, IsNotEmpty, IsString, MaxLength } from "class-validator";
import xss from "xss";

export class CreatePrivateKeyDTO {
  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @Transform(({ value }) => xss(value), { toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @IsAlphanumeric()
  name: string;

  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @Transform(({ value }) => xss(value), { toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  data: string;
}
