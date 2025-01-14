import "reflect-metadata";
import Server from "./server.js";
import { logger } from "./utils/index.js";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

const server: Server = new Server();

const exitHandler = () => {
  if (!server) process.exit(1);
  server.stop(() => {
    logger.info("Server closed!");
  });
};

const unexpectedErrorHandler = (error: Error) => {
  const statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  const message: string = error.message || getReasonPhrase(statusCode);
  logger.error(`${statusCode} ${message}${error?.stack ? "\n" + error?.stack : ""}`);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received!");
  if (!server) return;
  server.stop(() => {
    logger.info("Server closed!");
  });
});

async function initServer() {
  await server.init();
  server.start();
}

initServer();
