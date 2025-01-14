import { Router } from "express";
import container from "../../inversify.config.js";
import { TYPES } from "../../TYPES.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validateBodyDTO, validateParamDTO, validateQueryDTO } from "../../middleware/index.js";
import { Pagination } from "../../validations/pagination.validation.js";
import { ID } from "../../validations/index.js";
import { CreateProjectDto, IProjectController } from "../../project/index.js";
import { CreateEnvironmentDto } from "../../environment/index.js";

export class ProjectRouter {
  public readonly router: Router;
  private readonly projectController: IProjectController;

  constructor() {
    this.router = Router();
    this.projectController = container.get<IProjectController>(TYPES.ProjectController);
    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.get("/", authorize(), validateQueryDTO(Pagination), this.projectController.index);

    this.router.get("/:id", authorize(), validateParamDTO(ID), this.projectController.index);

    this.router.post(
      "/validate",
      authorize(),
      validateBodyDTO(CreateProjectDto),
      this.projectController.validate
    );

    this.router.post(
      "/",
      authorize(),
      validateBodyDTO(CreateProjectDto),
      this.projectController.create
    );

    this.router.post(
      "/:id/environments",
      authorize(),
      validateParamDTO(ID),
      validateBodyDTO(CreateEnvironmentDto),
      this.projectController.createEnvironment
    );

    this.router.delete("/:id", authorize(), validateParamDTO(ID), this.projectController.delete);
  }
}
