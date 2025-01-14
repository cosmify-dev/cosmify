import { Container } from "inversify";
import {
  IServerController,
  IServerRepository,
  IServerService,
  PostgresServerRepository,
  ServerController,
  ServerService
} from "./server/index.js";
import { IDatabase, PostgresDataSource } from "./config/database.js";
import {
  ActionController,
  ActionService,
  IActionController,
  IActionService
} from "./actions/index.js";
import {
  ISecurityController,
  ISecurityRepository,
  ISecurityService,
  PostgresSecurityRepository,
  SecurityController,
  SecurityService
} from "./security/index.js";
import { IRemoteService, SSHRemoteService } from "./remote/remote.service.js";
import { IActionRepository, PostgresActionRepository } from "./actions/index.js";
import { IInsightRepository, PostgresInsightRepository } from "./insight/index.js";
import {
  FluxorController,
  FluxorService,
  IFluxorController,
  IFluxorRepository,
  IFluxorService,
  PostgresFluxorRepository
} from "./fluxor/index.js";
import { IPortRepository, PostgresPortRepository } from "./port/index.js";
import {
  INetworkController,
  INetworkRepository,
  INetworkService,
  NetworkController,
  NetworkService,
  PostgresNetworkRepository
} from "./network/index.js";
import { IVolumeRepository, PostgresVolumeRepository } from "./volumes/volume.repository.js";
import {
  ITransactionRepository,
  PostgresTransactionRepository
} from "./transaction/transaction.repository.js";
import { ITransactionService, TransactionService } from "./transaction/transaction.service.js";
import {
  ITransactionController,
  TransactionController
} from "./transaction/transaction.controller.js";
import { DockerService, IDockerService } from "./docker/docker.service.js";
import { TYPES } from "./TYPES.js";
import {
  IContainerRepository,
  PostgresContainerRepository
} from "./container/container.repository.js";
import { ContainerService, IContainerService } from "./container/container.service.js";
import {
  IProjectController,
  IProjectRepository,
  IProjectService,
  PostgresProjectRepository,
  ProjectController,
  ProjectService
} from "./project/index.js";
import {
  EnvironmentService,
  IEnvironmentRepository,
  IEnvironmentService,
  PostgresEnvironmentRepository
} from "./environment/index.js";
import {
  EnvironmentController,
  IEnvironmentController
} from "./environment/environment.controller.js";
import { IEmailService, SmtpEmailService } from "./email/email.service.js";

const container = new Container();
container
  .bind<IServerRepository>(TYPES.ServerRepository)
  .to(PostgresServerRepository)
  .inSingletonScope();
container.bind<IServerService>(TYPES.ServerService).to(ServerService).inSingletonScope();
container.bind<IServerController>(TYPES.ServerController).to(ServerController).inSingletonScope();
container.bind<IDatabase>(TYPES.Database).to(PostgresDataSource).inSingletonScope();
container
  .bind<ISecurityRepository>(TYPES.SecurityRepository)
  .to(PostgresSecurityRepository)
  .inSingletonScope();
container.bind<IRemoteService>(TYPES.RemoteService).to(SSHRemoteService).inSingletonScope();
container
  .bind<IActionRepository>(TYPES.ActionRepository)
  .to(PostgresActionRepository)
  .inSingletonScope();
container.bind<IActionController>(TYPES.ActionController).to(ActionController).inSingletonScope();
container
  .bind<IInsightRepository>(TYPES.InsightRepository)
  .to(PostgresInsightRepository)
  .inSingletonScope();
container.bind<IActionService>(TYPES.ActionService).to(ActionService).inSingletonScope();
container.bind<IFluxorService>(TYPES.FluxorService).to(FluxorService).inSingletonScope();
container
  .bind<IFluxorRepository>(TYPES.FluxorRepository)
  .to(PostgresFluxorRepository)
  .inSingletonScope();
container.bind<IFluxorController>(TYPES.FluxorController).to(FluxorController).inSingletonScope();
container.bind<IPortRepository>(TYPES.PortRepository).to(PostgresPortRepository).inSingletonScope();
container
  .bind<INetworkRepository>(TYPES.NetworkRepository)
  .to(PostgresNetworkRepository)
  .inSingletonScope();
container.bind<INetworkService>(TYPES.NetworkService).to(NetworkService).inSingletonScope();
container
  .bind<INetworkController>(TYPES.NetworkController)
  .to(NetworkController)
  .inSingletonScope();
container
  .bind<IVolumeRepository>(TYPES.VolumeRepository)
  .to(PostgresVolumeRepository)
  .inSingletonScope();
container
  .bind<ITransactionRepository>(TYPES.TransactionRepository)
  .to(PostgresTransactionRepository)
  .inSingletonScope();
container
  .bind<ITransactionService>(TYPES.TransactionService)
  .to(TransactionService)
  .inSingletonScope();
container
  .bind<ITransactionController>(TYPES.TransactionController)
  .to(TransactionController)
  .inSingletonScope();
container.bind<IDockerService>(TYPES.DockerService).to(DockerService).inSingletonScope();
container.bind<ISecurityService>(TYPES.SecurityService).to(SecurityService).inSingletonScope();
container
  .bind<ISecurityController>(TYPES.SecurityController)
  .to(SecurityController)
  .inSingletonScope();
container
  .bind<IContainerRepository>(TYPES.ContainerRepository)
  .to(PostgresContainerRepository)
  .inSingletonScope();
container.bind<IContainerService>(TYPES.ContainerService).to(ContainerService).inSingletonScope();
container
  .bind<IProjectRepository>(TYPES.ProjectRepository)
  .to(PostgresProjectRepository)
  .inSingletonScope();
container.bind<IProjectService>(TYPES.ProjectService).to(ProjectService).inSingletonScope();
container
  .bind<IProjectController>(TYPES.ProjectController)
  .to(ProjectController)
  .inSingletonScope();
container
  .bind<IEnvironmentRepository>(TYPES.EnvironmentRepository)
  .to(PostgresEnvironmentRepository)
  .inSingletonScope();
container
  .bind<IEnvironmentService>(TYPES.EnvironmentService)
  .to(EnvironmentService)
  .inSingletonScope();
container
  .bind<IEnvironmentController>(TYPES.EnvironmentController)
  .to(EnvironmentController)
  .inSingletonScope();

container.bind<IEmailService>(TYPES.EmailService).to(SmtpEmailService).inSingletonScope();
export default container;
