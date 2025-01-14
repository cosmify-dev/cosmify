import { inject } from "inversify";
import {
  Command,
  ConflictError,
  convertCommandToString,
  Errors,
  HttpError,
  NotFoundError,
  Result,
  ServerNotFoundError
} from "../utils/index.js";
import { type IRemoteService } from "../remote/remote.service.js";
import { type IServerRepository, Server } from "../server/index.js";
import { type IActionRepository } from "./actions.repository.js";
import { ActionType, Status } from "./actions.type.js";
import { Action } from "./actions.entity.js";
import { type IInsightRepository } from "../insight/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { NodeSSH } from "node-ssh";
import nodePath from "node:path";
import {
  defaultDirectoryOptions,
  defaultExecutionOptions,
  defaultFileOptions,
  DirectoryOptions,
  ExecutionOptions,
  FileOptions
} from "../utils/types/options.type.js";
import { type ISecurityService, PrivateKey } from "../security/index.js";
import * as fs from "node:fs";
import * as os from "node:os";
import { Transaction } from "../transaction/transaction.entity.js";
import { TYPES } from "../TYPES.js";
import { StatusCodes } from "http-status-codes";
import { type Flux } from "../fluxor/index.js";

export interface IActionService {
  findAll(
    organizationId: string,
    serverId: string,
    pagination?: Pagination
  ): Promise<[Action[], number]>;
  findByFlux(
    organizationId: string,
    fluxId: string,
    pagination?: Pagination
  ): Promise<[Action[], number]>;
  findOneById(organizationId: string, id: string): Promise<Action | null>;
  executeCommandAction(
    organizationId: string,
    serverId: string,
    commands: Command[],
    type: ActionType,
    options?: ExecutionOptions
  ): Promise<CommandActionResult>;
  isReachable(organizationId: string, serverId: string): Promise<Status>;
  queryUptime(
    organizationId: string,
    serverId: string,
    options?: ExecutionOptions
  ): Promise<string>;
  update(
    organizationId: string,
    serverId: string,
    options?: ExecutionOptions
  ): Promise<CommandActionResult>;
  createFile(
    organizationId: string,
    serverId: string,
    path: string,
    options?: FileOptions & ExecutionOptions
  ): Promise<CommandActionResult>;
  createDirectory(
    organizationId: string,
    serverId: string,
    path: string,
    options?: DirectoryOptions & ExecutionOptions
  ): Promise<CommandActionResult>;
  removePath(
    organizationId: string,
    serverId: string,
    path: string | null,
    options?: ExecutionOptions & FileOptions
  ): Promise<CommandActionResult>;
  saveFile(
    organizationId: string,
    serverId: string,
    path: string,
    content: string,
    options?: { cwd: string; transaction: Transaction | undefined }
  ): Promise<ActionResult>;
  isCommandAvailable(
    organizationId: string,
    serverId: string,
    command: string,
    options?: ExecutionOptions
  ): Promise<boolean>;
  installDocker(
    organizationId: string,
    serverId: string,
    options?: ExecutionOptions
  ): Promise<CommandActionResult>;
  removeDocker(
    organizationId: string,
    serverId: string,
    options?: ExecutionOptions
  ): Promise<CommandActionResult>;
  queryServerInformation(
    organizationId: string,
    serverId: string,
    options?: ExecutionOptions
  ): Promise<CommandActionResult>;
}

export class ActionService implements IActionService {
  constructor(
    @inject(TYPES.ServerRepository)
    protected readonly serverRepository: IServerRepository,
    @inject(TYPES.SecurityService)
    protected readonly securityService: ISecurityService,
    @inject(TYPES.RemoteService)
    protected readonly remoteService: IRemoteService,
    @inject(TYPES.ActionRepository)
    protected readonly actionRepository: IActionRepository,
    @inject(TYPES.InsightRepository)
    protected readonly insightRepository: IInsightRepository
  ) {}

  public findAll = async (
    organizationId: string,
    serverId: string,
    pagination?: Pagination
  ): Promise<[Action[], number]> => {
    const server: Server | null = await this.serverRepository.findOneByID(organizationId, serverId);
    if (!server) throw new NotFoundError(`Server with id ${serverId} could not be found!`);
    return this.actionRepository.findAll(organizationId, serverId, pagination);
  };

  public findByFlux = async (
    organizationId: string,
    fluxId: string,
    pagination?: Pagination
  ): Promise<[Action[], number]> => {
    return this.actionRepository.findByFlux(organizationId, fluxId, pagination);
  };

  public findOneById = async (organizationId: string, id: string): Promise<Action | null> => {
    const action = await this.actionRepository.findOneById(organizationId, id);
    if (!action) throw new NotFoundError("Action not found");
    return action;
  };

  public isReachable = async (organizationId: string, serverId: string): Promise<Status> => {
    const server: Server | null = await this.serverRepository.findOneByID(organizationId, serverId);
    if (!server) throw new NotFoundError(`Server with id ${serverId} could not be found!`);
    const key: PrivateKey | null = await this.securityService.findByServerId(
      organizationId,
      serverId
    );
    if (!key) throw new NotFoundError(`PrivateKey with id ${serverId} could not be found!`);
    const sshClient: NodeSSH = await this.remoteService.connect(server, key);
    const isConnected = sshClient.isConnected();
    const status = isConnected ? Status.ONLINE : Status.OFFLINE;
    sshClient.dispose();
    if (server.status !== Status.PENDING)
      await this.serverRepository.updatePartial(organizationId, serverId, { status: status });
    return status;
  };

  public queryServerInformation = async (
    organizationId: string,
    serverId: string,
    options?: ExecutionOptions
  ): Promise<CommandActionResult> => {
    const osCommand: Command = {
      command: "cat",
      args: ["/etc/os-release"],
      converters: [
        async (server: Server, result: Result) => {
          if (result.success) {
            const data = result.stdout.trim().split("\n");

            const extractValue = (lines: string[], key: string) => {
              const line = lines.find((line) => line.startsWith(`${key}=`));
              return line ? line.split("=")[1].replace(/"/g, "") : "";
            };

            const prettyOs = extractValue(data, "PRETTY_NAME");
            const osId = extractValue(data, "ID");

            await this.serverRepository.updatePartial(organizationId, server.id, {
              prettyOs,
              osId
            });
          }
        }
      ]
    };
    return await this.executeCommandAction(
      organizationId,
      serverId,
      [osCommand],
      ActionType.FETCH_SERVER_INFORMATION,
      options
    );
  };

  public createDirectory = async (
    organizationId: string,
    serverId: string,
    path: string,
    options: DirectoryOptions & ExecutionOptions
  ): Promise<CommandActionResult> => {
    const localDirectoryOptions: DirectoryOptions = {
      ...defaultDirectoryOptions,
      ...(options || {})
    };

    const createDirectoryCommand: Command = {
      command: "mkdir",
      sudo: localDirectoryOptions.sudo,
      args: [
        localDirectoryOptions.createParents ? "-p" : "",
        localDirectoryOptions.mode ? `-m ${localDirectoryOptions.mode}` : "",
        path
      ]
    };

    return await this.executeCommandAction(
      organizationId,
      serverId,
      [createDirectoryCommand],
      ActionType.CREATE_DIRECTORY,
      options
    );
  };

  public saveFile = async (
    organizationId: string,
    serverId: string,
    path: string,
    content: string,
    options?: { transaction?: Transaction | undefined }
  ): Promise<ActionResult> => {
    const tempFilePath = nodePath.join(
      os.tmpdir(),
      `${organizationId}-${serverId}-${Date.now()}.txt`
    );

    fs.writeFileSync(tempFilePath, content);

    return this.executeFileAction(
      organizationId,
      serverId,
      tempFilePath,
      path,
      ActionType.SAVE_FILE,
      options
    );
  };

  public createFile = async (
    organizationId: string,
    serverId: string,
    path: string,
    options?: FileOptions & ExecutionOptions
  ): Promise<CommandActionResult> => {
    const localFileOptions: FileOptions = {
      ...defaultFileOptions,
      ...(options || {})
    };

    const directory = nodePath.dirname(path);

    const createDirectoryCommand: Command = {
      command: "mkdir",
      sudo: localFileOptions.sudo,
      args: ["-p", directory]
    };

    const createFileCommand: Command = {
      command: "touch",
      sudo: localFileOptions.sudo,
      args: [path]
    };

    const permissionCommand: Command = {
      command: "chmod",
      sudo: localFileOptions.sudo,
      args: [`${localFileOptions.mode}`, path]
    };

    return await this.executeCommandAction(
      organizationId,
      serverId,
      [createDirectoryCommand, createFileCommand, permissionCommand],
      ActionType.CREATE_FILE,
      options
    );
  };

  public removePath = async (
    organizationId: string,
    serverId: string,
    path: string | null,
    options?: FileOptions & ExecutionOptions
  ): Promise<CommandActionResult> => {
    if (!path) throw new NotFoundError("Path cozuld ");

    const localFileOptions: FileOptions = {
      ...defaultFileOptions,
      ...(options || {})
    };

    const removeDirectoryCommand: Command = {
      command: "rm",
      sudo: localFileOptions.sudo,
      args: [localFileOptions.recursive ? "-r" : "", "-f", path]
    };

    return await this.executeCommandAction(
      organizationId,
      serverId,
      [removeDirectoryCommand],
      ActionType.REMOVE_PATH,
      options
    );
  };

  public queryUptime = async (
    organizationId: string,
    serverId: string,
    options?: ExecutionOptions
  ): Promise<string> => {
    const uptimeCommand: Command = {
      command: "uptime",
      args: ["-p"]
    };
    const results: Map<Command, Result> = (
      await this.executeCommandAction(
        organizationId,
        serverId,
        [uptimeCommand],
        ActionType.FETCH_UPTIME,
        {
          ...options,
          async: false
        }
      )
    ).results;
    return results.get(uptimeCommand)?.stdout || "";
  };

  public isCommandAvailable = async (
    organizationId: string,
    serverId: string,
    command: string,
    options?: ExecutionOptions
  ): Promise<boolean> => {
    const execCommand = {
      command: "command",
      args: ["-v", command]
    };
    const data = await this.executeCommandAction(
      organizationId,
      serverId,
      [execCommand],
      ActionType.CHECK_COMMAND_AVAILABILITY,
      {
        ...options,
        async: false
      }
    );
    const result = data.results.get(execCommand);
    if (!result) return false;
    return result.success && result.stdout.trim().length > 0;
  };

  public executeCommandAction = async (
    organizationId: string,
    serverId: string,
    commands: Command[],
    type: ActionType,
    options?: ExecutionOptions
  ): Promise<CommandActionResult> => {
    const server: Server | null = await this.serverRepository.findOneByID(organizationId, serverId);
    if (!server) throw new NotFoundError(`Server with Id ${serverId} could not be found`);

    const key: PrivateKey | null = await this.securityService.findByServerId(
      organizationId,
      server.id
    );
    if (!key)
      throw new NotFoundError(
        `No private key found for server ${server.id}`,
        Errors.NO_PRIVATE_KEY_ATTACHED_TO_SERVER
      );

    const localOptions: ExecutionOptions = {
      ...defaultExecutionOptions,
      ...(options || {})
    };

    const action: Action = await this.actionRepository.save(organizationId, {
      server: server,
      status: Status.EXECUTING,
      type: type,
      transaction: localOptions.transaction,
      flux: localOptions.flux
    });

    let results: Map<Command, Result> = new Map();

    if (localOptions.async) {
      this.executeCommands(organizationId, server, key, action, commands, localOptions).then(
        (data) => {
          this.actionRepository.updatePartial(organizationId, action.id, {
            status: data.success ? Status.SUCCESS : Status.ERROR
          });
        }
      );
    } else {
      const data = await this.executeCommands(
        organizationId,
        server,
        key,
        action,
        commands,
        localOptions
      );
      results = data.results;

      action.status = data.success ? Status.SUCCESS : Status.ERROR;

      await this.actionRepository.updatePartial(organizationId, action.id, {
        status: action.status
      });
    }

    return {
      async: localOptions.async !== undefined ? localOptions.async : true,
      actionId: action.id,
      results: results,
      status: action.status
    };
  };

  public executeFileAction = async (
    organizationId: string,
    serverId: string,
    localPath: string,
    remotePath: string,
    type: ActionType,
    options?: {
      transaction?: Transaction;
      flux?: Flux;
    }
  ): Promise<ActionResult> => {
    const server: Server | null = await this.serverRepository.findOneByID(organizationId, serverId);
    if (!server) throw new NotFoundError(`Server with Id ${serverId} could not be found`);

    const key: PrivateKey | null = await this.securityService.findByServerId(
      organizationId,
      server.id
    );
    if (!key)
      throw new NotFoundError(
        `No private key found for server ${server.id}`,
        Errors.NO_PRIVATE_KEY_ATTACHED_TO_SERVER
      );

    const action: Action = await this.actionRepository.save(organizationId, {
      server: server,
      status: Status.EXECUTING,
      type: type,
      transaction: options?.transaction || undefined,
      flux: options?.flux || undefined
    });

    const result = await this.remoteService.putFile(server, key, localPath, remotePath);
    action.status = result.success ? Status.SUCCESS : Status.ERROR;
    await this.actionRepository.updatePartial(organizationId, action.id, {
      status: action.status
    });

    return {
      actionId: action.id,
      status: action.status
    };
  };

  private executeCommands = async (
    organizationId: string,
    server: Server,
    privateKey: PrivateKey,
    action: Action,
    commands: Command[],
    options: ExecutionOptions
  ): Promise<{
    results: Map<Command, Result>;
    success: boolean;
  }> => {
    let success = true;
    const results = new Map<Command, Result>();
    for (const command of commands) {
      if (!success && !options.ignoreErrorsOfPreviousCommands) break;
      try {
        const result: Result = await this.remoteService.executeCommands(
          server,
          privateKey,
          [command, "exit"],
          {
            cwd: options.cwd || "/"
          }
        );

        if (typeof command !== "string" && command?.converters)
          for (const converter of command.converters) await converter(server, result);

        if (!result.success || options.enableCommandLogs) {
          await this.insightRepository.saveCommandLog(organizationId, {
            server: server,
            action: action,
            command: convertCommandToString(command),
            stdout: result.stdout,
            stderr: result.stderr,
            status: result.success ? Status.SUCCESS : Status.ERROR
          });
        }

        results.set(command, result);

        success = success && result.success;
      } catch (error) {
        success = false;
        throw error;
      }
    }
    return {
      results: results,
      success: success
    };
  };

  public update = async (
    organizationId: string,
    serverId: string,
    options?: ExecutionOptions
  ): Promise<CommandActionResult> => {
    const server = await this.serverRepository.findOneByID(organizationId, serverId);
    if (!server) throw new ServerNotFoundError(organizationId, serverId);
    if (!server.osId) throw new ConflictError("Server has not yet been initialized!");

    let commands;
    switch (server.osId) {
      case "centos":
      case "fedora":
      case "rhel":
        commands = this.updateRhel();
        break;
      case "ubuntu":
      case "debian":
        commands = this.updateDebian();
        break;
      case "arch":
        commands = this.updateArch();
        break;
      case "alpine":
        commands = this.updateAlpine();
        break;
      case "opensuse":
        commands = this.updateSuse();
        break;
      default:
        throw new HttpError({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "Unsupported OS detected!"
        });
    }

    return this.executeCommandAction(
      organizationId,
      serverId,
      commands,
      ActionType.UPGRADE_SERVER_PACKAGES,
      options
    );
  };

  public installDocker = async (
    organizationId: string,
    serverId: string,
    options?: ExecutionOptions
  ): Promise<CommandActionResult> => {
    const server = await this.serverRepository.findOneByID(organizationId, serverId);
    if (!server) throw new ServerNotFoundError(organizationId, serverId);
    if (!server.osId) throw new ConflictError("Server has not yet been initialized!");

    let commands;
    switch (server.osId) {
      case "fedora":
        commands = this.installDockerFedora();
        break;
      case "ubuntu":
      case "debian":
        commands = this.installDockerDebian();
        break;
      case "arch":
        commands = this.installDockerArch();
        break;
      case "alpine":
        commands = this.installDockerAlpine();
        break;
      case "opensuse":
        commands = this.installDockerSuse();
        break;
      default:
        throw new HttpError({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "Unsupported OS detected!"
        });
    }

    return this.executeCommandAction(
      organizationId,
      serverId,
      commands,
      ActionType.INSTALL_DOCKER,
      options
    );
  };

  public removeDocker = async (
    organizationId: string,
    serverId: string,
    options?: ExecutionOptions
  ): Promise<CommandActionResult> => {
    const server = await this.serverRepository.findOneByID(organizationId, serverId);
    if (!server) throw new ServerNotFoundError(organizationId, serverId);

    let commands;
    switch (server.osId) {
      case "fedora":
        commands = this.removeDockerFedora();
        break;
      case "ubuntu":
      case "debian":
        commands = this.removeDockerDebian();
        break;
      case "arch":
      case "manjaro":
        commands = this.removeDockerArch();
        break;
      case "alpine":
        commands = this.removeDockerAlpine();
        break;
      case "opensuse":
        commands = this.removeDockerSuse();
        break;
      default:
        throw new HttpError({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "Unsupported OS detected!"
        });
    }

    return this.executeCommandAction(
      organizationId,
      serverId,
      commands,
      ActionType.REMOVE_DOCKER,
      options
    );
  };

  protected checkIfCommandExistsAndExit = (command: string): Command => {
    return {
      command: "command",
      args: ["-v", command],
      converters: [
        async (server, result) => {
          if (result.success && result.stdout.trim().length > 0) {
            result.stderr = `${command} is already installed! Please uninstall it first and retry!`;
            result.success = false;
          } else result.success = true;
        }
      ]
    };
  };

  private updateDebian = (): Command[] => [
    'echo "Updating and upgrading system..."',
    "sudo DEBIAN_FRONTEND=noninteractive apt-get update -y",
    "sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y",
    'echo "System upgrade complete!"'
  ];

  private installDockerDebian = (): Command[] => [
    this.checkIfCommandExistsAndExit("docker"),
    'echo "Installing dependencies..."',
    "sudo DEBIAN_FRONTEND=noninteractive apt-get update -y",
    "sudo DEBIAN_FRONTEND=noninteractive apt-get install ca-certificates curl -y",
    'echo "Adding Docker GPG key..."',
    "sudo install -m 0755 -d /etc/apt/keyrings",
    "sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc",
    "sudo chmod a+r /etc/apt/keyrings/docker.asc",
    'echo "Adding Docker repository..."',
    'echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null',
    "sudo DEBIAN_FRONTEND=noninteractive apt-get update -y",
    "sudo DEBIAN_FRONTEND=noninteractive apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
    'echo "Docker installed!"'
  ];

  private removeDockerDebian = (): Command[] => [
    'echo "Removing Docker..."',
    "sudo DEBIAN_FRONTEND=noninteractive apt-get purge docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y",
    'echo "Removing Docker directories (/var/lib/docker, /etc/docker)..."',
    "sudo rm -rf /var/lib/docker",
    "sudo rm -rf /etc/docker",
    "sudo DEBIAN_FRONTEND=noninteractive apt-get autoremove -y",
    'echo "Docker removed!"'
  ];

  private updateArch = (): Command[] => [
    'echo "Updating and upgrading system..."',
    "sudo pacman -Syu --noconfirm",
    'echo "System upgrade complete!"'
  ];

  private installDockerArch = (): Command[] => [
    this.checkIfCommandExistsAndExit("docker"),
    'echo "Installing Docker..."',
    "sudo pacman -Syu --noconfirm docker",
    'echo "Docker installed!"'
  ];

  private removeDockerArch = (): Command[] => [
    'echo "Removing Docker..."',
    "sudo pacman -Rns --noconfirm docker",
    "sudo rm -rf /var/lib/docker",
    "sudo rm -rf /etc/docker",
    'echo "Docker removed!"'
  ];

  private updateRhel = (): Command[] => [
    'echo "Updating and upgrading system..."',
    "sudo dnf update -y",
    'echo "System upgrade complete!"'
  ];

  private installDockerFedora = (): Command[] => [
    this.checkIfCommandExistsAndExit("docker"),
    'echo "Installing Docker..."',
    "sudo dnf install -y dnf-plugins-core",
    "sudo dnf-3 config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo",
    "sudo dnf --assumeyes install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
    'echo "Starting Docker service..."',
    "sudo systemctl enable --now docker",
    'echo "Docker installed!"'
  ];

  private removeDockerFedora = (): Command[] => [
    'echo "Removing Docker..."',
    "sudo dnf --assumeyes remove -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
    "sudo rm -rf /var/lib/docker",
    "sudo rm -rf /etc/docker",
    'echo "Docker removed!"'
  ];

  private updateAlpine = (): Command[] => [
    'echo "Updating and upgrading system..."',
    "sudo apk update",
    "sudo apk upgrade",
    'echo "System upgrade complete!"'
  ];

  private installDockerAlpine = (): Command[] => [
    this.checkIfCommandExistsAndExit("docker"),
    'echo "Installing Docker..."',
    "sudo apk --no-cache add docker",
    "sudo rc-update add docker boot",
    "sudo service docker start",
    'echo "Docker installed!"'
  ];

  private removeDockerAlpine = (): Command[] => [
    'echo "Removing Docker..."',
    "sudo apk del docker",
    "sudo rm -rf /var/lib/docker",
    "sudo rm -rf /etc/docker",
    'echo "Docker removed!"'
  ];

  private updateSuse = (): Command[] => [
    'echo "Updating and upgrading system..."',
    "sudo zypper refresh",
    "sudo zypper update -y",
    'echo "System upgrade complete!"'
  ];

  private installDockerSuse = (): Command[] => [
    this.checkIfCommandExistsAndExit("docker"),
    'echo "Installing Docker..."',
    "sudo zypper refresh",
    "sudo zypper install -y docker",
    "sudo systemctl start docker",
    "sudo systemctl enable docker",
    'echo "Docker installed!"'
  ];

  private removeDockerSuse = (): Command[] => [
    'echo "Removing Docker..."',
    "sudo zypper remove -y docker",
    "sudo rm -rf /var/lib/docker",
    "sudo rm -rf /etc/docker",
    'echo "Docker removed!"'
  ];
}

export type ActionResult = {
  actionId: string;
  status: Status;
};

export type CommandActionResult = ActionResult & {
  async: boolean;
  results: Map<Command, Result>;
};
