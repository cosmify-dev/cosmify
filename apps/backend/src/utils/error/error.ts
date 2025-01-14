import { NextFunction, Request, RequestHandler, Response } from "express";
import { Errors } from "./errors.js";
import { StatusCodes } from "http-status-codes";

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly details: string | undefined;
  public readonly error: Errors;
  public readonly data: object | undefined;
  constructor(data: {
    status: number;
    message: string;
    error?: Errors;
    stack?: string;
    details?: string;
    data?: object;
  }) {
    super(data.message);
    Object.setPrototypeOf(this, HttpError.prototype);
    this.statusCode = data.status;
    this.error = data.error || Errors.NONE;
    this.data = data.data;
    this.stack = data.stack;
    if (data.details) this.details = data.details;
    else Error.captureStackTrace(this, this.constructor);
  }
}

export class InternalServerError extends HttpError {
  constructor(details = "", error: Errors = Errors.NONE) {
    super({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Something went wrong. Internal server error",
      error,
      stack: "",
      details
    });
  }
}

export class UnauthorizedError extends HttpError {
  constructor(error: Errors = Errors.NONE) {
    super({
      status: StatusCodes.UNAUTHORIZED,
      message: "Unauthorized",
      error: error
    });
  }
}

export class NotFoundError extends HttpError {
  constructor(msg: string, error: Errors = Errors.NONE) {
    super({
      status: StatusCodes.NOT_FOUND,
      message: msg,
      error: error
    });
  }
}

export class ServerNotFoundError extends NotFoundError {
  constructor(organizationId: string, serverId: string) {
    super(`Server with ID ${serverId} for organization ${organizationId} could not be found!`);
  }
}

export class ConflictError extends HttpError {
  constructor(msg: string, error: Errors = Errors.NONE) {
    super({
      status: StatusCodes.CONFLICT,
      message: msg,
      error: error
    });
  }
}

export class BadRequestError extends HttpError {
  constructor(msg: string, error: Errors = Errors.NONE, data: object = {}) {
    super({
      status: StatusCodes.BAD_REQUEST,
      message: msg,
      error: error,
      data: data
    });
  }
}

export const catchError =
  (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
