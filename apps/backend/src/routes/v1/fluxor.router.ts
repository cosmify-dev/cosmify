import { Router } from "express";
import { validateBodyDTO, validateParamDTO, validateQueryDTO } from "../../middleware/index.js";
import { ID } from "../../validations/index.js";
import { IFluxorController } from "../../fluxor/index.js";
import { Pagination } from "../../validations/pagination.validation.js";
import { CreateFluxDTO, UpdateFluxDto } from "../../fluxor/flux.validation.js";
import { Timeframe } from "../../validations/timeframe.validation.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { Expose } from "class-transformer";
import { IsDefined, IsUUID } from "class-validator";
import container from "../../inversify.config.js";
import { TYPES } from "../../TYPES.js";

export class FluxorRouter {
  public readonly router: Router;
  private readonly fluxorController: IFluxorController;

  constructor() {
    this.router = Router();
    this.fluxorController = container.get<IFluxorController>(TYPES.FluxorController);
    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.get("/", authorize(), validateQueryDTO(Pagination), this.fluxorController.index);

    this.router.post("/composeFile", authorize(), this.fluxorController.composeFile);

    this.router.get("/:id", authorize(), validateParamDTO(ID), this.fluxorController.index);

    this.router.patch(
      "/:id",
      authorize(),
      validateParamDTO(ID),
      validateBodyDTO(UpdateFluxDto, {
        skipMissingProperties: true,
        exposeDefaultValues: false
      }),
      this.fluxorController.update
    );

    this.router.get(
      "/:id/actions",
      authorize(),
      validateParamDTO(ID),
      validateQueryDTO(Pagination),
      this.fluxorController.findActions
    );

    this.router.put(
      "/:id/restart",
      authorize(),
      validateParamDTO(ID),
      this.fluxorController.restart
    );

    this.router.put(
      "/:id/refreshImages",
      authorize(),
      validateParamDTO(ID),
      this.fluxorController.refreshImages
    );

    this.router.put("/:id/start", authorize(), validateParamDTO(ID), this.fluxorController.start);

    this.router.put("/:id/stop", authorize(), validateParamDTO(ID), this.fluxorController.stop);

    this.router.delete("/:id", authorize(), validateParamDTO(ID), this.fluxorController.delete);

    this.router.get(
      "/:id/composeFile",
      authorize(),
      validateParamDTO(ID),
      this.fluxorController.composeFile
    );

    this.router.get(
      "/:id/containers/:containerId/logs/query",
      authorize(),
      validateParamDTO(ContainerParams),
      validateQueryDTO(Timeframe, {
        skipMissingProperties: true
      }),
      this.fluxorController.queryContainerLogs
    );

    this.router.get(
      "/:id/stats/query",
      authorize(),
      validateParamDTO(ID),
      this.fluxorController.queryContainerStats
    );

    this.router.post(
      "/validate",
      authorize(),
      validateBodyDTO(CreateFluxDTO),
      this.fluxorController.validate
    );

    this.router.post(
      "/",
      authorize(),
      validateBodyDTO(CreateFluxDTO),
      this.fluxorController.create
    );
  }
}

export class ContainerParams extends ID {
  @Expose()
  @IsDefined({
    message: "must contain property $property"
  })
  @IsUUID("4")
  containerId!: string;
}
