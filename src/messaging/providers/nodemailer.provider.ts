import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

@Injectable()
export class NodemailerProvider {
  private readonly logger = new Logger(NodemailerProvider.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const host = this.configService.get<string>("NODEMAILER_HOST");
    const port = this.configService.get<number>("NODEMAILER_PORT");
    const encryption = this.configService.get<string>("NODEMAILER_ENCRYPTION");
    const authUser = this.configService.get<string>("NODEMAILER_AUTH_USER");
    const authPass = this.configService.get<string>("NODEMAILER_AUTH_PASS");

    if (!host || !port || !authUser || !authPass) {
      this.logger.error("Nodemailer configuration is incomplete");
      throw new Error("Email configuration is missing required parameters");
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: encryption === "ssl", // true for 465, false for other ports
      auth: {
        user: authUser,
        pass: authPass,
      },
      tls: {
        rejectUnauthorized: false, // For development only
      },
    });

    this.logger.log("Nodemailer transporter initialized");
  }

  async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log("Email service connection verified successfully");
    } catch (error) {
      this.logger.error("Email service connection failed:", error);
      throw new Error("Failed to verify email service connection");
    }
  }

  async sendMail(mailOptions: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>;
  }): Promise<{ messageId: string }> {
    try {
      const senderName = this.configService.get<string>(
        "NODEMAILER_SENDER_NAME"
      );
      const senderEmail = this.configService.get<string>(
        "NODEMAILER_SENDER_MAIL"
      );

      const mailConfig = {
        from: `"${senderName}" <${senderEmail}>`,
        to: Array.isArray(mailOptions.to)
          ? mailOptions.to.join(", ")
          : mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text,
        attachments: mailOptions.attachments,
      };

      this.logger.log(
        `Sending email to: ${mailConfig.to}, Subject: ${mailConfig.subject}`
      );

      const result = await this.transporter.sendMail(mailConfig);

      this.logger.log(
        `Email sent successfully. Message ID: ${result.messageId}`
      );

      return {
        messageId: result.messageId,
      };
    } catch (error) {
      this.logger.error("Failed to send email:", error);
      throw error;
    }
  }

  // Get transporter for advanced usage
  getTransporter(): Transporter {
    return this.transporter;
  }
}
