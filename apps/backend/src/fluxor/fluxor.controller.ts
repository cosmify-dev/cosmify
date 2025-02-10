import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { catchError, NotFoundError } from "../utils/index.js";
import { StatusCodes } from "http-status-codes";
import { ID } from "../validations/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { type IFluxorService } from "./fluxor.service.js";
import { Flux } from "./flux.entity.js";
import { CreateFluxDTO, UpdateFluxDto } from "./flux.validation.js";
import { Timeframe } from "../validations/timeframe.validation.js";
import { type INetworkRepository, Network } from "../network/index.js";
import { type IDockerService } from "../docker/docker.service.js";
import { TYPES } from "../TYPES.js";
import { Container } from "../container/container.entity.js";
import { ContainerParams } from "../routes/v1/fluxor.router.js";
import { type IActionService, Status } from "../actions/index.js";
import { type ITransactionService } from "../transaction/transaction.service.js";

export interface IFluxorController {
  index(req: Request, res: Response, next: NextFunction): Promise<void>;
  findActions(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  composeFile(req: Request, res: Response, next: NextFunction): Promise<void>;
  validate(req: Request, res: Response, next: NextFunction): Promise<void>;
  start(req: Request, res: Response, next: NextFunction): Promise<void>;
  restart(req: Request, res: Response, next: NextFunction): Promise<void>;
  refreshImages(req: Request, res: Response, next: NextFunction): Promise<void>;
  stop(req: Request, res: Response, next: NextFunction): Promise<void>;
  queryContainerLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
  queryContainerStats(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}

@injectable()
export class FluxorController implements IFluxorController {
  constructor(
    @inject(TYPES.FluxorService)
    private readonly fluxorService: IFluxorService,
    @inject(TYPES.ActionService)
    private readonly actionService: IActionService,
    @inject(TYPES.NetworkRepository)
    private readonly networkRepository: INetworkRepository,
    @inject(TYPES.DockerService)
    private readonly dockerService: IDockerService,
    @inject(TYPES.TransactionService)
    private readonly transactionService: ITransactionService
  ) {}

  public index = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const pagination: Pagination = res.locals.query;
    const organizationId: string = res.locals.organizationId;

    if (params && params.id?.length > 0) {
      const flux: Flux | null = await this.fluxorService.findOneById(organizationId, params.id);
      res.status(StatusCodes.OK).json(flux);
      return;
    }
    const fluxes = await this.fluxorService.findAll(organizationId, pagination);

    res.status(StatusCodes.OK).json(fluxes);
  });

  public findActions = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const pagination: Pagination = res.locals.query;
    const organizationId: string = res.locals.organizationId;

    const actions = await this.actionService.findByFlux(organizationId, params.id, pagination);

    res.status(StatusCodes.OK).json({
      data: actions[0],
      total: actions[1],
      ...pagination
    });
  });

  public create = catchError(async (req: Request, res: Response): Promise<void> => {
    const dto: CreateFluxDTO = res.locals.body;
    const organizationId: string = res.locals.organizationId;

    const flux = await this.fluxorService.save(organizationId, dto);

    await this.transactionService.runFlux(organizationId, flux.server.id, flux.id);

    res.status(StatusCodes.OK).json({
      item: flux
    });
  });

  public update = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const dto: UpdateFluxDto = res.locals.body;
    const organizationId: string = res.locals.organizationId;

    const flux = await this.fluxorService.update(organizationId, params.id, dto);

    res.status(StatusCodes.OK).json({
      item: flux
    });
  });

  public composeFile = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const dto: CreateFluxDTO = req.body;
    const organizationId: string = res.locals.organizationId;

    let composeFileContent: string;
    if (params) {
      const flux = await this.fluxorService.findOneById(organizationId, params.id);
      composeFileContent = this.dockerService.generateComposeFileContent(
        flux.name,
        flux.containers
      );
    } else {
      type ConvertedContainerDto = Omit<Container, "networks"> & {
        networks: Network[];
      };
      const convertedContainers = [] as ConvertedContainerDto[];
      for (const container of dto.containers) {
        const newContainer = JSON.parse(JSON.stringify(container)) as ConvertedContainerDto;
        newContainer.networks = await this.networkRepository.findByIds(
          organizationId,
          container.networks
        );
        convertedContainers.push(newContainer);
      }
      composeFileContent = this.dockerService.generateComposeFileContent(
        dto.name,
        convertedContainers
      );
    }

    res.status(StatusCodes.OK).json({
      content: composeFileContent
    });
  });

  public validate = catchError(async (req: Request, res: Response): Promise<void> => {
    res.status(StatusCodes.OK).end();
  });

  public queryContainerLogs = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ContainerParams = res.locals.params;
    const timeframe: Timeframe = res.locals.query;
    const organizationId: string = res.locals.organizationId;

    const flux: Flux | null = await this.fluxorService.findOneById(organizationId, params.id);
    const container = flux.containers.find((container) => container.id === params.containerId);
    if (!container) throw new NotFoundError(`Container with id ${params.containerId} not found!`);
    const logs = await this.dockerService.queryLogs(
      organizationId,
      flux.server.id,
      `${flux.name}_${container.name}`,
      timeframe,
      {
        enableCommandLogs: false,
        flux: flux
      }
    );

    res.status(StatusCodes.OK).json(logs);
  });

  public queryContainerStats = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    const flux: Flux | null = await this.fluxorService.findOneById(organizationId, params.id);
    const stats = await this.dockerService.queryStats(
      organizationId,
      flux.server.id,
      flux.containers.flatMap((container) => {
        return `${flux.name}_${container.name}`;
      }),
      {
        flux: flux
      }
    );

    res.json(stats).status(StatusCodes.OK);
  });

  public start = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    const flux: Flux | null = await this.fluxorService.findOneById(organizationId, params.id);
    if (!flux || !flux.directoryPath)
      throw new NotFoundError(`Flux with id ${params.id} not found!`);

    const stats = await this.dockerService.start(
      organizationId,
      flux.server.id,
      flux.name,
      `${flux.directoryPath}docker-compose.yml`,
      {
        flux: flux
      }
    );

    await this.fluxorService.update(organizationId, flux.id, {
      status: Status.ONLINE
    });

    res.json(stats).status(StatusCodes.OK);
  });

  public refreshImages = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    const flux: Flux | null = await this.fluxorService.findOneById(organizationId, params.id);
    if (!flux || !flux.directoryPath)
      throw new NotFoundError(`Flux with id ${params.id} not found!`);

    const transactionId = await this.transactionService.refreshImages(
      organizationId,
      flux.server.id,
      flux.id
    );

    await this.fluxorService.update(organizationId, flux.id, {
      status: Status.ONLINE
    });

    res
      .json({
        transactionId: transactionId
      })
      .status(StatusCodes.OK);
  });

  public restart = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    const flux: Flux | null = await this.fluxorService.findOneById(organizationId, params.id);
    if (!flux || !flux.directoryPath)
      throw new NotFoundError(`Flux with id ${params.id} not found!`);

    const stats = await this.dockerService.restart(
      organizationId,
      flux.server.id,
      flux.name,
      `${flux.directoryPath}docker-compose.yml`,
      {
        flux: flux
      }
    );

    res.json(stats).status(StatusCodes.OK);
  });

  public stop = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    const flux: Flux | null = await this.fluxorService.findOneById(organizationId, params.id);
    if (!flux || !flux.directoryPath)
      throw new NotFoundError(`Flux with id ${params.id} not found!`);

    const stats = await this.dockerService.stop(
      organizationId,
      flux.server.id,
      flux.name,
      `${flux.directoryPath}docker-compose.yml`,
      flux.shutdownTimeout,
      {
        flux: flux
      }
    );

    await this.fluxorService.update(organizationId, flux.id, {
      status: Status.OFFLINE
    });

    res.json(stats).status(StatusCodes.OK);
  });

  public delete = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    await this.transactionService.removeFlux(organizationId, params.id);

    res.status(StatusCodes.OK);
  });
}
