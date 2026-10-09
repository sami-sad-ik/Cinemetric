/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { envVars } from "../../config/env";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import path from "path";
import ejs from "ejs";

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.EMAIL_SENDER_SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.EMAIL_SENDER_SMTP_USER,
    pass: envVars.EMAIL_SENDER.EMAIL_SENDER_SMTP_PASS,
  },
  port: Number(envVars.EMAIL_SENDER.EMAIL_SENDER_SMTP_PORT),
});

interface EmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: EmailOptions) => {
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/app/template/${templateName}.ejs`,
    );
    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.EMAIL_SENDER_SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    console.log(`Email sent to ${to} : ${info.message}`);
  } catch (error: any) {
    console.log("Error sending email", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Error sending email");
  }
};
