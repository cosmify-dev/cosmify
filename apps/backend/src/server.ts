import express from "express";
import type { Application, NextFunction, Request, Response } from "express";
import * as http from "http";
import helmet from "helmet";
import cors from "cors";
import { Routes } from "./routes/v1/routes.js";
import { config, initConfig } from "./config/config.js";
import { errorConverterMiddleware, errorHandlerMiddleware } from "./middleware/index.js";
import {
  errorHandler,
  initLogger,
  initMorgan,
  logger,
  NotFoundError,
  successHandler
} from "./utils/index.js";
import { IDatabase } from "./config/database.js";
import container from "./inversify.config.js";
import { TYPES } from "./TYPES.js";
import { initSmtp } from "./utils/smtp.js";
import { toNodeHandler } from "better-auth/node";
import { auth, initAuth } from "./utils/auth.js";

export default class Server {
  private readonly app: Application;
  private readonly httpServer: http.Server;
  private routes: Routes | undefined;
  private postgresDataSource: IDatabase;

  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.postgresDataSource = container.get<IDatabase>(TYPES.Database);
  }

  public async init(): Promise<void> {
    initConfig();
    initLogger();
    initMorgan();
    initSmtp();
    initAuth();

    this.initMiddlewares();
    await this.createConnectionsToExternalServices();
    this.initRouters();
    this.initErrorMiddleware();
  }

  private initMiddlewares(): void {
    if (config.NODE_ENV !== "test") {
      this.app.use(successHandler);
      this.app.use(errorHandler);
    }
    this.app.use(
      helmet({
        hsts: false
      })
    );
    // this.app.use(cors());
    this.app.use(
      cors({
        origin: "http://localhost:5173", // Replace with your frontend's origin
        methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
        credentials: true
      })
    );
    this.app.all("/v1/auth/*", toNodeHandler(auth.handler));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.set("trust proxy", true);
  }

  private initErrorMiddleware(): void {
    this.app.use(errorConverterMiddleware);
    this.app.use(errorHandlerMiddleware);
  }

  private async createConnectionsToExternalServices() {
    await this.postgresDataSource
      .init()
      .then(() => logger.info("Successfully established connection to Postgres instance!"))
      .catch((error) =>
        logger.error("Error while establishing connection to Postgres instance! \n" + error)
      );
  }

  private initRouters() {
    this.routes = new Routes();
    this.app.use("/v1", this.routes.router);
    this.app.get("/status", (req: Request, res: Response) => res.json("OK"));
    this.app.get("/", (req: Request, res: Response) => res.json("Hello world!"));
    this.app.all("*", (req: Request, res: Response, next: NextFunction) =>
      next(new NotFoundError(`Can not find ${req.originalUrl}`))
    );
  }

  public start() {
    this.httpServer.listen(config.PORT, () => {
      logger.info(`Server listening at: http://localhost:${config.PORT}`);
    });
  }

  public stop(callback?: (err?: Error) => void) {
    if (!this.httpServer) return;
    this.httpServer.close(callback);
  }
}
