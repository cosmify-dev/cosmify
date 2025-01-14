import { Expose, Transform } from "class-transformer";
import {
  IsAlphanumeric,
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min
} from "class-validator";
import { validateInt, validateXss } from "../utils/utils.js";

export class CreateServerDTO {
  @Expose({ groups: ["create", "update"] })
  @Transform(({ value }) => validateXss(value))
  @IsString({
    message: "Name must be a string"
  })
  @MaxLength(256, {
    message: "Name must be shorter than or equal to $constraint1"
  })
  @IsAlphanumeric("en-US", {
    message: "Name must contain only letters and numbers (a-z,A-Z,0-9)"
  })
  name: string;

  @Expose({ groups: ["create", "update"] })
  @Transform(({ value }) => validateXss(value))
  @IsString()
  description = "";

  @Expose({ groups: ["create"] })
  @IsIP(undefined, {
    message: "IP must be a valid IP address"
  })
  ip: string;

  @Expose({ groups: ["create", "update"] })
  @Transform(({ value }) => validateInt(value))
  @IsNumber(
    {},
    {
      message: "Port must be a number"
    }
  )
  @Min(0, {
    message: "Port must be greater than or equal to $constraint1"
  })
  @Max(65535, {
    message: "Port must be less than or equal to $constraint1"
  })
  port = 22;

  @Expose({ groups: ["create", "update"] })
  @Transform(({ value }) => validateXss(value))
  @IsString({
    message: "User must be a string"
  })
  @IsNotEmpty({
    message: "User must not be empty"
  })
  user: string;

  @Expose({ groups: ["create", "update"] })
  @IsUUID("4", {
    message: "SSH key must be a valid UUIDv4"
  })
  privateKey: string;
}
