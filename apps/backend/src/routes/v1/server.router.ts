import { Router } from "express";
import container from "../../inversify.config.js";
import { TYPES } from "../../TYPES.js";
import { validateBodyDTO, validateParamDTO, validateQueryDTO } from "../../middleware/index.js";
import { CreateServerDTO, IServerController } from "../../server/index.js";
import { IActionController } from "../../actions/index.js";
import { ID } from "../../validations/index.js";
import { Pagination } from "../../validations/pagination.validation.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

export class ServerRouter {
  public readonly router: Router;
  private readonly serverController: IServerController;
  private readonly actionController: IActionController;

  constructor() {
    this.router = Router();
    this.serverController = container.get<IServerController>(TYPES.ServerController);
    this.actionController = container.get<IActionController>(TYPES.ActionController);

    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.get("/", authorize(), validateQueryDTO(Pagination), this.serverController.index);
    this.router.get("/:id", authorize(), validateParamDTO(ID), this.serverController.index);

    this.router.post(
      "/validate",
      authenticate,
      validateBodyDTO(CreateServerDTO, {
        groups: ["create"]
      }),
      this.serverController.validate
    );

    this.router.post(
      "/",
      authorize(),
      validateBodyDTO(CreateServerDTO, {
        groups: ["create"]
      }),
      this.serverController.create
    );

    this.router.patch(
      "/:id",
      authorize(),
      validateParamDTO(ID),
      validateBodyDTO(CreateServerDTO, {
        groups: ["update"],
        skipMissingProperties: true,
        exposeDefaultValues: false
      }),
      this.serverController.update
    );

    this.router.get(
      "/:id/defaultNetwork",
      authorize(),
      validateParamDTO(ID),
      this.serverController.findDefaultNetwork
    );

    this.router.patch("/:id/init", authorize(), validateParamDTO(ID), this.serverController.init);

    this.router.delete("/:id", authorize(), validateParamDTO(ID), this.serverController.delete);

    this.router.get(
      "/:id/actions",
      authorize(),
      validateQueryDTO(Pagination),
      validateParamDTO(ID),
      this.actionController.index
    );

    this.router.post(
      "/:id/actions/checkConnectivity",
      authorize(),
      validateParamDTO(ID),
      this.actionController.checkConnectivity
    );

    this.router.get(
      "/:id/actions/uptime",
      authorize(),
      validateParamDTO(ID),
      this.actionController.uptime
    );
  }
}
