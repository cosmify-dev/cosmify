import { inject, injectable } from "inversify";
import { ConflictError, NotFoundError } from "../utils/index.js";
import { type ITransactionRepository } from "./transaction.repository.js";
import { Transaction } from "./transaction.entity.js";
import { ActionResult, type IActionService, Status, TransactionStatus } from "../actions/index.js";
import { type IServerService } from "../server/index.js";
import { type INetworkService } from "../network/index.js";
import { type IFluxorService } from "../fluxor/index.js";
import { type IDockerService } from "../docker/docker.service.js";
import { config } from "../config/index.js";
import { TYPES } from "../TYPES.js";

export interface ITransactionService {
  findById(organizationId: string, id: string): Promise<Transaction>;
  initServer(organizationId: string, serverId: string): Promise<string>;
  runFlux(
    organizationId: string,
    serverId: string,
    fluxId: string
  ): Promise<{
    transactionId: string;
  }>;
  removeFlux(organizationId: string, fluxId: string): Promise<string>;
}

@injectable()
export class TransactionService implements ITransactionService {
  constructor(
    @inject(TYPES.TransactionRepository)
    private readonly transactionRepository: ITransactionRepository,
    @inject(TYPES.ServerService)
    private readonly serverService: IServerService,
    @inject(TYPES.DockerService)
    private readonly dockerService: IDockerService,
    @inject(TYPES.ActionService)
    private readonly actionService: IActionService,
    @inject(TYPES.FluxorService)
    private readonly fluxorService: IFluxorService,
    @inject(TYPES.NetworkService)
    private readonly networkService: INetworkService
  ) {}

  public findById = async (organizationId: string, id: string): Promise<Transaction> => {
    const transaction: Transaction | null = await this.transactionRepository.findOneById(
      organizationId,
      id
    );
    if (!transaction) throw new NotFoundError(`Transaction ${id} not found`);
    return transaction;
  };

  public initServer = async (organizationId: string, serverId: string): Promise<string> => {
    const server = await this.serverService.findServerById(organizationId, serverId);
    if (server.status !== Status.PENDING)
      throw new ConflictError("Server was already initialized!");

    await this.serverService.updateServer(organizationId, server.id, {
      status: Status.INITIALIZING
    });
    const transaction = await this.transactionRepository.save(organizationId, "server_validation");

    this.executeTransaction(organizationId, transaction.id, [
      () =>
        this.actionService.createDirectory(
          organizationId,
          server.id,
          config.REMOTE_SERVER_CONFIG_PATH,
          {
            transaction: transaction,
            async: false
          }
        ),
      () =>
        this.actionService.createDirectory(
          organizationId,
          server.id,
          `${config.REMOTE_SERVER_CONFIG_PATH}/fluxor`,
          {
            transaction: transaction,
            async: false
          }
        ),
      () =>
        this.actionService.queryServerInformation(organizationId, server.id, {
          transaction: transaction,
          async: false
        }),
      () =>
        this.actionService.update(organizationId, server.id, {
          transaction: transaction,
          async: false
        }),
      () =>
        this.actionService.installDocker(organizationId, server.id, {
          transaction: transaction,
          async: false
        }),
      () =>
        this.networkService.save(organizationId, server.id, server.name, true, {
          transaction: transaction,
          async: false
        })
    ]).then((status: TransactionStatus) => {
      this.serverService.updateServer(organizationId, server.id, {
        status: status === TransactionStatus.SUCCESS ? Status.ONLINE : Status.PENDING
      });
    });

    return transaction.id;
  };

  public runFlux = async (
    organizationId: string,
    serverId: string,
    fluxId: string
  ): Promise<{
    transactionId: string;
  }> => {
    await this.serverService.findServerById(organizationId, serverId);
    const flux = await this.fluxorService.findOneById(organizationId, fluxId);
    const transaction = await this.transactionRepository.save(organizationId, "run_flux");

    const content: string = this.dockerService.generateComposeFileContent(
      flux.name,
      flux.containers
    );
    const cwd = `${config.REMOTE_SERVER_CONFIG_PATH}/fluxor/${flux.name}/`;
    const fileName = "docker-compose.yml";

    await this.fluxorService.update(organizationId, flux.id, {
      status: Status.PENDING,
      directoryPath: cwd
    });

    this.executeTransaction(organizationId, transaction.id, [
      () =>
        this.actionService.createDirectory(organizationId, serverId, cwd, {
          sudo: true,
          async: false,
          flux: flux
        }),
      ...flux.containers
        .flatMap((container) => container.volumes)
        .filter((volume) => volume.create)
        .map((volume) => {
          if (volume.type === "file")
            return () =>
              this.actionService.createFile(organizationId, serverId, volume.hostPath, {
                mode: volume.permission,
                cwd: cwd,
                async: false,
                flux: flux
              });
          else
            return () =>
              this.actionService.createDirectory(organizationId, serverId, volume.hostPath, {
                mode: volume.permission,
                cwd: cwd,
                async: false,
                flux: flux
              });
        }),
      () => this.actionService.saveFile(organizationId, serverId, `${cwd}${fileName}`, content),
      ...flux.containers
        .flatMap((container) => container.image)
        .flatMap(
          (image) => () =>
            this.dockerService.pullImage(organizationId, serverId, image, {
              async: false,
              flux: flux
            })
        ),
      () =>
        this.dockerService.start(organizationId, serverId, flux.name, fileName, {
          cwd: cwd,
          async: false,
          flux: flux
        })
    ]).then(async () => {
      await this.fluxorService.update(organizationId, flux.id, {
        status: Status.ONLINE
      });
    });
    return {
      transactionId: transaction.id
    };
  };

  public removeFlux = async (organizationId: string, fluxId: string): Promise<string> => {
    const flux = await this.fluxorService.findOneById(organizationId, fluxId);
    const server = await this.serverService.findServerById(organizationId, flux.server.id);

    const transaction = await this.transactionRepository.save(organizationId, "remove_flux");

    await this.fluxorService.update(organizationId, flux.id, {
      status: Status.DELETING
    });

    this.executeTransaction(organizationId, transaction.id, [
      () =>
        this.dockerService.stop(
          organizationId,
          server.id,
          flux.name,
          `${flux.directoryPath}docker-compose.yml`,
          flux.shutdownTimeout,
          {
            async: false,
            flux: flux
          }
        ),
      () =>
        this.actionService.removePath(organizationId, server.id, flux.directoryPath, {
          sudo: true,
          recursive: true,
          async: false,
          flux: flux
        })
    ]).then(async () => {
      await this.fluxorService.delete(organizationId, flux.id);
    });
    return transaction.id;
  };

  private executeTransaction = async (
    organizationId: string,
    transactionId: string,
    actions: (() => Promise<ActionResult>)[]
  ): Promise<TransactionStatus> => {
    await this.transactionRepository.updatePartial(organizationId, transactionId, {
      status: TransactionStatus.EXECUTING
    });
    let isSuccessful = true;
    for (const action of actions) {
      const result = await action();
      if (result.status !== Status.SUCCESS) {
        isSuccessful = false;
        break;
      }
    }

    const status = isSuccessful ? TransactionStatus.SUCCESS : TransactionStatus.ERROR;
    await this.transactionRepository.updatePartial(organizationId, transactionId, {
      status
    });

    return status;
  };
}
