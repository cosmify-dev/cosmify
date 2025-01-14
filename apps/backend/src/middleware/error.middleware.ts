import { NextFunction, Request, Response } from "express";
import { config } from "../config/config.js";
import { Errors, HttpError, logger } from "../utils/index.js";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

export const errorConverterMiddleware = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let httpError: HttpError;
  if (!(error instanceof HttpError))
    httpError = new HttpError({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      error: Errors.NONE,
      stack: error.stack,
      details: error.message
    });
  else httpError = error as HttpError;
  next(httpError);
};

export const errorHandlerMiddleware = (
  error: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDev: boolean = config.NODE_ENV !== "production";
  res.locals.error = error.message;
  logger.error(
    `Error occurred: ${error.statusCode} ${error.message} \nDetails: ${error.details} ${
      isDev && error.stack ? "\nStack: " + error.stack : ""
    }`
  );
  res
    .status(error.statusCode)
    .json({
      message: error.message,
      error: Errors[error.error],
      data: error.data,
      ...(isDev && { stack: error.stack })
    })
    .end();
  next();
};
