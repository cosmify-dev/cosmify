import { Expose, Transform } from "class-transformer";
import { IsAlphanumeric, IsDefined, IsNotEmpty, MaxLength } from "class-validator";
import xss from "xss";

export class CreateEnvironmentDto {
  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @Transform(({ value }) => xss(value), { toClassOnly: true })
  @IsNotEmpty()
  @IsAlphanumeric()
  @MaxLength(256)
  name: string;
}
