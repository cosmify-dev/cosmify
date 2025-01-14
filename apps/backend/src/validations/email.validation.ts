import { Expose, Transform } from "class-transformer";
import { IsDefined, IsEmail } from "class-validator";
import xss from "xss";

export class Email {
  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @IsEmail()
  @Transform(({ value }) => xss(value), { toClassOnly: true })
  email!: string;
}
