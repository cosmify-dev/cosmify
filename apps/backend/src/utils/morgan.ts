import morgan from "morgan";
import { logger } from "./logger.js";
import { Request, Response } from "express";
import { config } from "../config/config.js";

export function initMorgan() {
  morgan.token("host", (req: Request) => (config.NODE_ENV === "production" ? req.hostname : ""));
  morgan.token("errorMessage", (req: Request, res: Response) => res.locals.error || "");
}

const successResponseFormat = `:method :host :url :status :res[content-length] - :response-time ms`;
const errorResponseFormat = `:method :host :url :status :res[content-length] - :response-time ms - message: :errorMessage`;

export const successHandler = morgan(successResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode >= 400 && config.NODE_ENV === "production",
  stream: { write: (message: string) => logger.info(message.trim()) }
});

export const errorHandler = morgan(errorResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode < 400,
  stream: { write: (message: string) => logger.error(message.trim()) }
});
