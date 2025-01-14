import { Router } from "express";
import container from "../../inversify.config.js";
import { TYPES } from "../../TYPES.js";
import { validateBodyDTO, validateParamDTO, validateQueryDTO } from "../../middleware/index.js";
import { ID } from "../../validations/index.js";
import { Pagination } from "../../validations/pagination.validation.js";
import { INetworkController } from "../../network/index.js";
import { CreateNetworkDto } from "../../network/network.validation.js";
import { authorize } from "../../middleware/authorize.middleware.js";

export class NetworkRouter {
  public readonly router: Router;
  private readonly networkController: INetworkController;

  constructor() {
    this.router = Router();
    this.networkController = container.get<INetworkController>(TYPES.NetworkController);
    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.get("/", authorize(), validateQueryDTO(Pagination), this.networkController.index);
    this.router.get("/:id", authorize(), validateParamDTO(ID), this.networkController.index);
    this.router.post(
      "/validate",
      authorize(),
      validateBodyDTO(CreateNetworkDto),
      this.networkController.validate
    );
    this.router.post(
      "/",
      authorize(),
      validateBodyDTO(CreateNetworkDto),
      this.networkController.create
    );
    this.router.delete("/:id", authorize(), validateParamDTO(ID), this.networkController.delete);
  }
}
