import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { catchError } from "../utils/index.js";
import { StatusCodes } from "http-status-codes";
import { ID } from "../validations/index.js";
import { TYPES } from "../TYPES.js";
import { type IEnvironmentService } from "../environment/index.js";

export interface IEnvironmentController {
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}

@injectable()
export class EnvironmentController implements IEnvironmentController {
  constructor(
    @inject(TYPES.EnvironmentService)
    private readonly environmentService: IEnvironmentService
  ) {}

  public delete = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    await this.environmentService.delete(organizationId, params.id);

    res.status(StatusCodes.OK);
  });
}
