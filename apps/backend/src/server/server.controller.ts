import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { type IServerService } from "./server.service.js";
import { catchError, NotFoundError } from "../utils/index.js";
import { ID } from "../validations/index.js";
import { StatusCodes } from "http-status-codes";
import { CreateServerDTO } from "./server.validation.js";
import { Server } from "./server.entity.js";
import { type ISecurityService, PrivateKey } from "../security/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { type ITransactionService } from "../transaction/transaction.service.js";
import { TYPES } from "../TYPES.js";
import { type INetworkService, Network } from "../network/index.js";

export interface IServerController {
  index(req: Request, res: Response, next: NextFunction): Promise<void>;
  validate(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  findDefaultNetwork(req: Request, res: Response, next: NextFunction): Promise<void>;
  init(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}

@injectable()
export class ServerController implements IServerController {
  constructor(
    @inject(TYPES.ServerService)
    private readonly serverService: IServerService,
    @inject(TYPES.SecurityService)
    private readonly securityService: ISecurityService,
    @inject(TYPES.TransactionService)
    private readonly transactionService: ITransactionService,
    @inject(TYPES.NetworkService)
    private readonly networkService: INetworkService
  ) {}

  public index = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const pagination: Pagination = res.locals.query;
    const organizationId: string = res.locals.organizationId;
    if (params && params.id?.length > 0) {
      const server: Server | null = await this.serverService.findServerById(
        organizationId,
        params.id
      );
      res.json(server).status(StatusCodes.OK).end();
      return;
    }
    const servers = await this.serverService.findAll(organizationId, pagination);
    res.json(servers).status(StatusCodes.OK).end();
  });

  public validate = catchError(async (req: Request, res: Response): Promise<void> => {
    res.status(StatusCodes.OK).end();
  });

  public create = catchError(async (req: Request, res: Response): Promise<void> => {
    const dto: CreateServerDTO = res.locals.body;
    const organizationId: string = res.locals.organizationId;
    const server = await this.serverService.saveServer(organizationId, dto);
    res.json({ item: server }).status(StatusCodes.OK).end();
  });

  public init = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;
    const transactionId: string = await this.transactionService.initServer(
      organizationId,
      params.id
    );
    res.json({ transactionId: transactionId }).status(StatusCodes.OK).end();
  });

  public findDefaultNetwork = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;
    const network: Network = await this.networkService.findDefaultForServer(
      organizationId,
      params.id
    );
    res.json(network).status(StatusCodes.OK).end();
  });

  public update = catchError(async (req: Request, res: Response): Promise<void> => {
    const requestParams: ID = res.locals.params;
    const dto: CreateServerDTO = res.locals.body;
    const organizationId: string = res.locals.organizationId;
    const privateKey: PrivateKey | null = await this.securityService.findById(
      organizationId,
      dto.privateKey
    );
    if (!privateKey)
      throw new NotFoundError(`SSH Key with ID ${dto.privateKey} could not be found!`);
    const server = await this.serverService.updateServer(organizationId, requestParams.id, {
      ...dto,
      privateKey: privateKey
    });
    res.json(server).status(StatusCodes.OK).end();
  });

  public delete = catchError(async (req: Request, res: Response): Promise<void> => {
    const requestParams: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;
    await this.serverService.deleteServer(organizationId, requestParams.id);
    res.status(StatusCodes.OK).end();
  });
}
