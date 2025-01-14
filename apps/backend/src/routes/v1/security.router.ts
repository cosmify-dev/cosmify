import { Router } from "express";
import container from "../../inversify.config.js";
import { TYPES } from "../../TYPES.js";
import { validateBodyDTO, validateParamDTO, validateQueryDTO } from "../../middleware/index.js";
import { ID } from "../../validations/index.js";
import { ISecurityController } from "../../security/index.js";
import { CreatePrivateKeyDTO } from "../../security/index.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { Pagination } from "../../validations/pagination.validation.js";

export class SecurityRouter {
  public readonly router: Router;
  private readonly securityController: ISecurityController;

  constructor() {
    this.router = Router();
    this.securityController = container.get<ISecurityController>(TYPES.SecurityController);
    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.get(
      "/keys",
      authorize(),
      validateQueryDTO(Pagination),
      this.securityController.indexKeys
    );
    this.router.get(
      "/keys/:id",
      authorize(),
      validateQueryDTO(Pagination),
      validateParamDTO(ID),
      this.securityController.indexKey
    );
    this.router.post(
      "/keys",
      authorize(),
      validateBodyDTO(CreatePrivateKeyDTO),
      this.securityController.createKey
    );
    this.router.delete(
      "/keys/:id",
      authorize(),
      validateParamDTO(ID),
      this.securityController.deleteKey
    );
  }
}
