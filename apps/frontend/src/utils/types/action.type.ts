export type Action = {
  id: string;
  type: string;
  status: Status;
  commandLogs: CommandLog[];
  createdAt: Date;
  updatedAt: Date;
};

export type CommandLog = {
  id: string;
  action: Action;
  server: string;
  command: string;
  stdout: string;
  stderr: string;
  status: Status;
  createdAt: Date;
};

export enum Status {
  "PENDING" = "PENDING",
  "EXECUTING" = "EXECUTING",
  "SUCCESS" = "SUCCESS",
  "ERROR" = "ERROR"
}

export enum FluxStatus {
  "ONLINE" = "ONLINE",
  "OFFLINE" = "OFFLINE",
  "PENDING" = "PENDING",
  "DELETING" = "DELETING"
}

export enum ServerStatus {
  "INITIALIZING" = "INITIALIZING",
  "PENDING" = "PENDING",
  "OFFLINE" = "OFFLINE",
  "ONLINE" = "ONLINE",
  "DELETING" = "DELETING"
}
