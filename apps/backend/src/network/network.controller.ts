import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { catchError } from "../utils/index.js";
import { StatusCodes } from "http-status-codes";
import { ID } from "../validations/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { type INetworkService } from "./network.service.js";
import { CreateNetworkDto } from "./network.validation.js";
import { Network } from "./network.entity.js";
import { TYPES } from "../TYPES.js";

export interface INetworkController {
  index(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  validate(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}

@injectable()
export class NetworkController implements INetworkController {
  constructor(
    @inject(TYPES.NetworkService)
    private readonly networkService: INetworkService
  ) {}

  public index = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const query: Pagination = res.locals.query;
    const organizationId: string = res.locals.organizationId;

    if (params && params.id?.length > 0) {
      const network: Network | null = await this.networkService.findOneById(
        organizationId,
        params.id
      );
      res.status(StatusCodes.OK).json(network);
      return;
    }
    const networks = await this.networkService.findAll(organizationId, query);

    res.status(StatusCodes.OK).json(networks);
  });

  public create = catchError(async (req: Request, res: Response): Promise<void> => {
    const dto: CreateNetworkDto = res.locals.body;
    const organizationId: string = res.locals.organizationId;

    const creationData = await this.networkService.save(
      organizationId,
      dto.server,
      dto.name,
      false
    );

    res.status(StatusCodes.OK).json({
      item: creationData.network,
      actionId: creationData.actionId
    });
  });

  public validate = catchError(async (req: Request, res: Response): Promise<void> => {
    res.status(StatusCodes.OK).end();
  });

  public delete = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    await this.networkService.delete(organizationId, params.id);

    res.status(StatusCodes.OK).end();
  });
}
