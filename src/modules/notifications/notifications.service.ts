import { Injectable, Logger } from "@nestjs/common";
import { EmailService as MessagingEmailService } from "../../messaging/services/email.service";
import { SendEmailDto } from "./dto";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly emailService: MessagingEmailService) {}

  async sendEmail(sendEmailDto: SendEmailDto) {
    try {
      const { to, subject, template, data } = sendEmailDto;
      const result = await this.emailService.sendTemplateEmail(
        template,
        to,
        subject,
        data
      );

      this.logger.log(
        `Email sent to ${sendEmailDto.to}: ${sendEmailDto.subject} - Status: ${result.status}`
      );

      return {
        messageId: result.messageId,
        status: result.status,
        error: result.error,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${sendEmailDto.to}:`, error);
      return {
        messageId: "",
        status: "failed",
        error: error.message,
      };
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string) {
    return this.emailService.sendWelcomeEmail(userEmail, userName);
  }

  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string
  ) {
    return this.emailService.sendPasswordResetEmail(
      userEmail,
      userName,
      resetToken
    );
  }

  async sendPlanUpdateNotification(
    patientEmail: string,
    patientName: string,
    nutritionistName: string,
    planName: string,
    changes?: string[],
    actionUrl?: string
  ) {
    return this.emailService.sendPlanUpdateEmail(
      patientEmail,
      patientName,
      nutritionistName,
      planName,
      changes,
      actionUrl
    );
  }
}
