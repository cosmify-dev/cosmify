import { Router } from "express";
import container from "../../inversify.config.js";
import { TYPES } from "../../TYPES.js";
import { validateParamDTO } from "../../middleware/index.js";
import { type IActionController } from "../../actions/index.js";
import { ID } from "../../validations/index.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

export class ActionRouter {
  public readonly router: Router;
  private readonly actionController: IActionController;

  constructor() {
    this.router = Router();
    this.actionController = container.get<IActionController>(TYPES.ActionController);
    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.get("/:id", authenticate, validateParamDTO(ID), this.actionController.findOne);
  }
}
