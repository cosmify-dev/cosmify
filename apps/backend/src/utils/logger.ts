import { createLogger, format, transports, config as winstonConfig, Logger } from "winston";
import { config } from "../config/config.js";

const { combine, timestamp, json, align, printf, errors, splat } = format;

export let logger: Logger;

export function initLogger() {
  const globalFormat = combine(
    config.NODE_ENV === "production" ? format.uncolorize() : format.colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    align(),
    errors({
      stack: true
    }),
    splat()
  );

  logger = createLogger({
    levels: winstonConfig.syslog.levels,
    level: config.NODE_ENV === "production" ? "info" : "debug",
    format: combine(globalFormat, json()),
    transports: [
      new transports.Console({
        format: combine(
          globalFormat,
          printf((info) => `${info.timestamp} ${info.level}: ${(info.message as string).trim()}`)
        )
      })
    ],
    exceptionHandlers: [
      new transports.Console({
        format: combine(
          globalFormat,
          printf((info) => `[${info.timestamp}] ${info.level}: ${(info.message as string).trim()}`)
        )
      })
    ]
  });
}
