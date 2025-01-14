import { Expose, Transform } from "class-transformer";
import { IsDefined, IsInt, Max, Min } from "class-validator";

export class CreatePortDto {
  @Expose()
  @IsDefined()
  @Transform((value) => parseInt(value.value))
  @IsInt()
  @Min(1)
  @Max(65535)
  hostPort: number;

  @Expose()
  @IsDefined()
  @Transform((value) => parseInt(value.value))
  @IsInt()
  @Min(1)
  @Max(65535)
  containerPort: number;
}
