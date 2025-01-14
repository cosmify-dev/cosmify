import { Router } from "express";
import container from "../../inversify.config.js";
import { TYPES } from "../../TYPES.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validateParamDTO } from "../../middleware/index.js";
import { ID } from "../../validations/index.js";
import { type IEnvironmentController } from "../../environment/environment.controller.js";

export class EnvironmentRouter {
  public readonly router: Router;
  private readonly environmentController: IEnvironmentController;

  constructor() {
    this.router = Router();
    this.environmentController = container.get<IEnvironmentController>(TYPES.EnvironmentController);

    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.delete(
      "/:id",
      authorize(),
      validateParamDTO(ID),
      this.environmentController.delete
    );
  }
}
