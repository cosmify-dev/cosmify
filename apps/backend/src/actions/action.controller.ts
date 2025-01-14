import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { catchError } from "../utils/index.js";
import { StatusCodes } from "http-status-codes";
import { ID } from "../validations/index.js";
import { ActionResult, type IActionService } from "./actions.service.js";
import { Pagination } from "../validations/pagination.validation.js";
import { Status } from "./actions.type.js";
import { TYPES } from "../TYPES.js";

export interface IActionController {
  index(req: Request, res: Response, next: NextFunction): Promise<void>;
  findOne(req: Request, res: Response, next: NextFunction): Promise<void>;
  uptime(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  checkConnectivity(req: Request, res: Response, next: NextFunction): Promise<void>;
  queryServerInformation(req: Request, res: Response, next: NextFunction): Promise<void>;
  installDocker(req: Request, res: Response, next: NextFunction): Promise<void>;
}

@injectable()
export class ActionController implements IActionController {
  constructor(
    @inject(TYPES.ActionService)
    private readonly actionService: IActionService
  ) {}

  public index = catchError(async (req: Request, res: Response): Promise<void> => {
    const dto: ID = res.locals.params;
    const pagination: Pagination = res.locals.query;
    const organizationId: string = res.locals.organizationId;

    const result = await this.actionService.findAll(organizationId, dto.id, pagination);

    res.status(StatusCodes.OK).json({
      data: result[0],
      total: result[1],
      ...pagination
    });
  });

  public findOne = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    const result = await this.actionService.findOneById(organizationId, params.id);

    res.json(result).status(StatusCodes.OK).end();
  });

  public checkConnectivity = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    const actionResult: Status = await this.actionService.isReachable(organizationId, params.id);

    res.status(StatusCodes.OK).json({ status: actionResult });
  });

  public uptime = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    const actionResult = await this.actionService.queryUptime(organizationId, params.id);

    res.json({ pretty: actionResult }).status(StatusCodes.OK).end();
  });

  public update = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    const result = await this.actionService.update(organizationId, params.id);

    res.status(StatusCodes.OK).json({
      actionId: result.actionId
    });
  });

  public queryServerInformation = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    const result = await this.actionService.queryServerInformation(organizationId, params.id);

    res.status(StatusCodes.OK).json({
      actionId: result.actionId
    });
  });

  public installDocker = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    const result: ActionResult = await this.actionService.installDocker(organizationId, params.id);

    res.status(StatusCodes.OK).json({ actionId: result.actionId });
  });
}
