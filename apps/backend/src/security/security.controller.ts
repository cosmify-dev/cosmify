import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { catchError, NotFoundError } from "../utils/index.js";
import { ID } from "../validations/index.js";
import { StatusCodes } from "http-status-codes";
import { CreatePrivateKeyDTO } from "./privatekey.validation.js";
import { PrivateKey, PrivateKeyDTO } from "./privatekey.entity.js";
import { Pagination } from "../validations/pagination.validation.js";
import { type ISecurityService } from "./security.service.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { TYPES } from "../TYPES.js";

export interface ISecurityController {
  indexKeys(req: Request, res: Response, next: NextFunction): Promise<void>;
  indexKey(req: Request, res: Response, next: NextFunction): Promise<void>;
  createKey(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteKey(req: Request, res: Response, next: NextFunction): Promise<void>;
}

@injectable()
export class SecurityController implements ISecurityController {
  constructor(
    @inject(TYPES.SecurityService)
    private readonly securityService: ISecurityService
  ) {}

  public indexKeys = catchError(async (req: Request, res: Response): Promise<void> => {
    const pagination: Pagination = res.locals.query;
    const organizationId: string = res.locals.organizationId;
    const privateKeys: PaginationResult<PrivateKey> = await this.securityService.findAll(
      organizationId,
      pagination
    );
    const filteredKeys: PaginationResult<PrivateKeyDTO> = {
      ...privateKeys,
      data: privateKeys.data.map((key) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data, ...filteredKey } = key;
        return filteredKey;
      })
    };
    res.json(filteredKeys).status(StatusCodes.OK).end();
  });

  public indexKey = catchError(async (req: Request, res: Response): Promise<void> => {
    const organizationId: string = res.locals.organizationId;
    const params: ID = res.locals.params;
    const privateKey: PrivateKey | null = await this.securityService.findById(
      organizationId,
      params.id
    );
    if (!privateKey) throw new NotFoundError(`Private key with id ${params.id} not found!`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, ...filteredKey } = privateKey;
    res.json(filteredKey);
  });

  public createKey = catchError(async (req: Request, res: Response): Promise<void> => {
    const dto: CreatePrivateKeyDTO = res.locals.body;
    const organizationId: string = res.locals.organizationId;
    const key = await this.securityService.save(organizationId, dto.name, dto.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, ...filteredKey } = key;
    res.json({ item: filteredKey }).status(StatusCodes.CREATED).end();
  });

  public deleteKey = catchError(async (req: Request, res: Response): Promise<void> => {
    const requestParams: ID = res.locals.params;
    const organizationId: string = res.locals.organizationId;
    await this.securityService.delete(organizationId, requestParams.id);
    res.status(StatusCodes.OK).end();
  });
}
