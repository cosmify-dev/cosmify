import { Expose } from "class-transformer";
import { IsDateString, IsNotEmpty } from "class-validator";

export class Timeframe {
  @Expose()
  @IsNotEmpty()
  @IsDateString()
  since: string;

  @Expose()
  @IsNotEmpty()
  @IsDateString()
  until: string;
}
