import { Router } from "express";
import container from "../../inversify.config.js";
import { TYPES } from "../../TYPES.js";
import { validateParamDTO } from "../../middleware/index.js";
import { ID } from "../../validations/index.js";
import { ITransactionController } from "../../transaction/transaction.controller.js";
import { authorize } from "../../middleware/authorize.middleware.js";

export class TransactionRouter {
  public readonly router: Router;
  private readonly transactionController: ITransactionController;

  constructor() {
    this.router = Router();
    this.transactionController = container.get<ITransactionController>(TYPES.TransactionController);
    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.get("/:id", authorize(), validateParamDTO(ID), this.transactionController.index);
  }
}
