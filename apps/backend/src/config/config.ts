import joi from "joi";
import { DEFAULT_PORT, DEFAULT_SMTP_PORT } from "../utils/index.js";

export type Config = {
  NODE_ENV: string;
  PORT: number;
  DATABASE: {
    HOST: string;
    PORT: number;
    USERNAME: string;
    PASSWORD: string;
    NAME: string;
  };
  SSH_KEY_PATH: string;
  REMOTE_SERVER_CONFIG_PATH: string;
  FRONTEND_BASE_URL: string;
  AUTH: {
    GITHUB_ID: string;
    GITHUB_SECRET: string;
    SECURE_COOKIES: boolean;
  };
  SMTP: {
    HOST: string;
    PORT: number;
    SECURE: boolean;
  };
};

export let config: Config;

export function initConfig() {
  const envSchema = joi
    .object()
    .keys({
      NODE_ENV: joi.string().valid("development", "production", "test").default("development"),
      PORT: joi.number().positive().port().default(DEFAULT_PORT),
      DATABASE_HOST: joi.string().hostname().required(),
      DATABASE_PORT: joi.number().positive().port().default(5432),
      DATABASE_USERNAME: joi.string().required(),
      DATABASE_PASSWORD: joi.string().required(),
      DATABASE_NAME: joi.string().required(),
      SSH_KEY_PATH: joi.string().required(),
      FRONTEND_BASE_URL: joi.string().required(),
      REMOTE_SERVER_CONFIG_PATH: joi.string().default("/var/lib/cosmify"),
      AUTH_GITHUB_SECRET: joi.string().required(),
      AUTH_GITHUB_ID: joi.string().required(),
      AUTH_SECURE_COOKIES: joi.boolean().default(true),
      SMTP_HOST: joi.string().required(),
      SMTP_PORT: joi.number().port().default(DEFAULT_SMTP_PORT),
      SMTP_SECURE: joi.boolean().default(true)
    })
    .unknown();

  const { value: envVariables, error } = envSchema
    .prefs({ errors: { label: "key" } })
    .validate(process.env);

  if (error) console.log(`Config validation error: ${error.message}`);

  config = Object.freeze({
    NODE_ENV: envVariables.NODE_ENV,
    PORT: envVariables.PORT,
    DATABASE: {
      HOST: envVariables.DATABASE_HOST,
      PORT: envVariables.DATABASE_PORT,
      USERNAME: envVariables.DATABASE_USERNAME,
      PASSWORD: envVariables.DATABASE_PASSWORD,
      NAME: envVariables.DATABASE_NAME
    },
    FRONTEND_BASE_URL: envVariables.FRONTEND_BASE_URL,
    SSH_KEY_PATH: envVariables.SSH_KEY_PATH,
    REMOTE_SERVER_CONFIG_PATH: envVariables.REMOTE_SERVER_CONFIG_PATH,
    AUTH: {
      GITHUB_ID: envVariables.AUTH_GITHUB_ID,
      GITHUB_SECRET: envVariables.AUTH_GITHUB_SECRET,
      SECURE_COOKIES: envVariables.AUTH_SECURE_COOKIES
    },
    SMTP: {
      HOST: envVariables.SMTP_HOST,
      PORT: envVariables.SMTP_PORT,
      SECURE: envVariables.SMTP_SECURE
    }
  });
}
