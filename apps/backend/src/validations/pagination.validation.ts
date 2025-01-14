import { Expose, Transform } from "class-transformer";
import { IsDefined, IsInt, Max, Min } from "class-validator";

export class Pagination {
  @Expose()
  @IsDefined()
  @Transform((value) => parseInt(value.value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @Expose()
  @IsDefined()
  @Transform((value) => parseInt(value.value))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;

  public get skip(): number {
    return (this.page - 1) * this.pageSize;
  }

  public get take(): number {
    return this.pageSize;
  }
}
