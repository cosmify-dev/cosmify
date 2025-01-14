import { Router } from "express";
import { ServerRouter } from "./server.router.js";
import { SecurityRouter } from "./security.router.js";
import { ActionRouter } from "./action.router.js";
import { FluxorRouter } from "./fluxor.router.js";
import { NetworkRouter } from "./network.router.js";
import { TransactionRouter } from "./transaction.route.js";
import { ProjectRouter } from "./project.router.js";
import { EnvironmentRouter } from "./environment.router.js";

export class Routes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.router.use("/actions", new ActionRouter().router);
    this.router.use("/servers", new ServerRouter().router);
    this.router.use("/security", new SecurityRouter().router);
    this.router.use("/fluxor", new FluxorRouter().router);
    this.router.use("/networks", new NetworkRouter().router);
    this.router.use("/transactions", new TransactionRouter().router);
    this.router.use("/projects", new ProjectRouter().router);
    this.router.use("/environments", new EnvironmentRouter().router);
  }
}
