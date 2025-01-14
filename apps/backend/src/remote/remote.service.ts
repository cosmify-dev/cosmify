import { injectable } from "inversify";
import { Server } from "../server/index.js";
import * as fs from "node:fs";
import { NodeSSH } from "node-ssh";
import { Command, CommandExecutionOptions, defaultResult } from "../utils/index.js";
import { config } from "../config/index.js";
import { PrivateKey } from "../security/index.js";
import type { Result } from "../utils/index.js";

export interface IRemoteService {
  executeCommands(
    server: Server,
    privateKey: PrivateKey,
    commands: Command[],
    options?: CommandExecutionOptions
  ): Promise<Result>;
  executeCommand(
    server: Server,
    privateKey: PrivateKey,
    command: Command,
    options?: CommandExecutionOptions
  ): Promise<Result>;
  putFile(server: Server, privateKey: PrivateKey, local: string, remote: string): Promise<Result>;
  connect(server: Server, privateKey: PrivateKey): Promise<NodeSSH>;
  execute(ssh: NodeSSH, command: Command, options?: CommandExecutionOptions): Promise<Result>;
  close(ssh: NodeSSH | undefined): void;
}

@injectable()
export class SSHRemoteService implements IRemoteService {
  logMessageTransformers: LogMessageTransformer[] = [
    (result: Result) => {
      if (result.code === 0) return;
      const regex = /bash: line \d+: (.*): command not found/;
      const match = result.stderr.match(regex);
      if (!match || match[1] === null) return;
      result.stderr = `${match[1]} not found. Please install ${match[1]} first and retry!`;
    }
  ];

  public executeCommands = async (
    server: Server,
    privateKey: PrivateKey,
    commands: Command[],
    options?: CommandExecutionOptions
  ): Promise<Result> => {
    const command = commands.map((command) => this.convertCommandToString(command)).join(" && ");
    return this.executeCommand(server, privateKey, command, options);
  };

  public executeCommand = async (
    server: Server,
    privateKey: PrivateKey,
    command: Command,
    options?: CommandExecutionOptions
  ): Promise<Result> => {
    let ssh: NodeSSH;
    try {
      ssh = await this.connect(server, privateKey);
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string; code?: string };
      return {
        ...defaultResult(),
        stderr: `Error while connecting via SSH: ${error.code || "Unknown code"}, ${
          error.message || "No message available"
        }`
      };
    }
    const result = await this.execute(ssh, command, options);
    this.close(ssh);
    return result;
  };

  public putFile = async (
    server: Server,
    privateKey: PrivateKey,
    local: string,
    remote: string
  ): Promise<Result> => {
    let ssh: NodeSSH;
    try {
      ssh = await this.connect(server, privateKey);
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string; code?: string };
      return {
        ...defaultResult(),
        stderr: `Error while connecting via SSH: ${error.code || "Unknown code"}, ${
          error.message || "No message available"
        }`
      };
    }
    const result = defaultResult();
    try {
      await ssh.putFile(local, remote);
      result.code = 0;
      result.success = true;
    } catch (error) {
      result.code = 1;
      result.stderr = `${error}`;
    }
    this.close(ssh);
    return result;
  };

  public connect = async (server: Server, privateKey: PrivateKey): Promise<NodeSSH> => {
    const ssh = new NodeSSH();

    await ssh.connect({
      port: server.port,
      host: server.ip,
      username: server.user,
      privateKeyPath: await this.savePrivateKeyToDisk(server, privateKey)
    });

    return ssh;
  };

  public execute = async (
    ssh: NodeSSH,
    command: Command,
    options?: CommandExecutionOptions
  ): Promise<Result> => {
    const result: Result = defaultResult();

    try {
      const response = await ssh.execCommand(this.convertCommandToString(command), options);

      result.code = response.code;
      result.signal = response.signal;
      result.stdout = response.stdout;
      result.stderr = response.stderr;
      result.success = response.code === 0;

      this.logMessageTransformers.forEach((transformer) => {
        transformer(result);
      });
    } catch (error) {
      result.code = 1;
      result.stderr = `${error}`;
    }

    result.stdout = result.stdout.trim().replace(/^\s+|\s+$/g, "");
    result.stderr = result.stderr.trim().replace(/^\s+|\s+$/g, "");
    return result;
  };

  public close = (ssh: NodeSSH | undefined): void => {
    if (!ssh) return;
    ssh.dispose();
  };

  private convertCommandToString = (command: Command): string => {
    if (typeof command === "string") return command;
    return `${command.command} ${command.args ? command.args.join(" ") : ""}`;
  };

  private savePrivateKeyToDisk = async (
    server: Server,
    privateKey: PrivateKey
  ): Promise<string> => {
    const path = `${config.SSH_KEY_PATH}${server.id}@${privateKey.id}`;
    fs.writeFileSync(path, privateKey.data, { encoding: "utf8" });
    return path;
  };
}

type LogMessageTransformer = (result: Result) => void;
