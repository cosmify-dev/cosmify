import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { catchError } from "../utils/index.js";
import { ID } from "../validations/index.js";
import { StatusCodes } from "http-status-codes";
import { type ITransactionService } from "./transaction.service.js";
import { TYPES } from "../TYPES.js";

export interface ITransactionController {
  index(req: Request, res: Response, next: NextFunction): Promise<void>;
}

@injectable()
export class TransactionController implements ITransactionController {
  constructor(
    @inject(TYPES.TransactionService)
    private readonly transactionService: ITransactionService
  ) {}

  public index = catchError(async (req: Request, res: Response): Promise<void> => {
    const params: ID = res.locals.params;
    const organizationId = res.locals.organizationId;

    const transaction = await this.transactionService.findById(organizationId, params.id);

    res.json({ item: transaction }).status(StatusCodes.OK).end();
  });
}
