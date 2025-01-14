import { injectable } from "inversify";
import type Mail from "nodemailer/lib/mailer/index.js";
import { transporter } from "../utils/smtp.js";

export interface IEmailService {
  sendEmail(options: Mail.Options): Promise<void>;
}

@injectable()
export class SmtpEmailService implements IEmailService {
  public sendEmail = async (options: Mail.Options): Promise<void> => {
    await transporter.sendMail(options);
  };
}
