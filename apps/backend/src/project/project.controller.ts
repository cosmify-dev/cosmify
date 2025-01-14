import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { catchError } from "../utils/index.js";
import { StatusCodes } from "http-status-codes";
import { ID } from "../validations/index.js";
import { Pagination } from "../validations/pagination.validation.js";
import { TYPES } from "../TYPES.js";
import { type IProjectService } from "./project.service.js";
import { Project } from "./project.entity.js";
import { CreateProjectDto, UpdateProjectDto } from "./project.validation.js";
import { CreateEnvironmentDto, type IEnvironmentService } from "../environment/index.js";

export interface IProjectController {
  index(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  validate(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  createEnvironment(req: Request, res: Response, next: NextFunction): Promise<void>;
}

@injectable()
export class ProjectController implements IProjectController {
  constructor(
    @inject(TYPES.ProjectService)
    private readonly projectService: IProjectService,
    @inject(TYPES.EnvironmentService)
    private readonly environmentService: IEnvironmentService
  ) {}

  public index = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const pagination: Pagination = res.locals.query;
    const organizationId: string = res.locals.organizationId;

    if (params && params.id?.length > 0) {
      const project: Project | null = await this.projectService.findOneById(
        organizationId,
        params.id
      );
      res.status(StatusCodes.OK).json(project);
      return;
    }
    const projects = await this.projectService.findAll(organizationId, pagination);

    res.status(StatusCodes.OK).json(projects);
  });

  public create = catchError(async (req: Request, res: Response): Promise<void> => {
    const dto: CreateProjectDto = res.locals.body;
    const organizationId: string = res.locals.organizationId;

    const project = await this.projectService.save(organizationId, dto);

    res.status(StatusCodes.OK).json({
      item: project
    });
  });

  public update = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const dto: UpdateProjectDto = res.locals.body;
    const organizationId: string = res.locals.organizationId;

    const project = await this.projectService.update(organizationId, params.id, dto);

    res.status(StatusCodes.OK).json({
      item: project
    });
  });

  public validate = catchError(async (req: Request, res: Response): Promise<void> => {
    res.status(StatusCodes.OK).end();
  });

  public delete = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;

    await this.projectService.delete(organizationId, params.id);

    res.status(StatusCodes.OK);
  });

  public createEnvironment = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const dto: CreateEnvironmentDto = res.locals.body;
    const organizationId: string = res.locals.organizationId;

    const environment = await this.environmentService.save(organizationId, params.id, dto);

    res.status(StatusCodes.OK).json({
      item: environment
    });
  });
}
