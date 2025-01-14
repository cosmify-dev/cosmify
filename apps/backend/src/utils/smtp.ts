import nodemailer, { Transporter } from "nodemailer";
import { config } from "../config/index.js";

export let transporter: Transporter;

export function initSmtp() {
  transporter = nodemailer.createTransport({
    host: config.SMTP.HOST,
    port: config.SMTP.PORT,
    secure: config.SMTP.SECURE
  });
}
