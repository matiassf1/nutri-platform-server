import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  EmailResponse,
  SendEmailOptions,
} from "../interfaces/send-email-options.interface";
import { NodemailerProvider } from "../providers/nodemailer.provider";
import { EmailTemplateName } from "../types/email.types";
import { EmailTemplateService } from "./email-template.service";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly nodemailerProvider: NodemailerProvider
  ) {}

  async sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
    try {
      const html = this.emailTemplateService.renderCustomTemplate(
        options.templateName,
        options.templateData
      );

      const result = await this.nodemailerProvider.sendMail({
        to: options.to,
        subject: options.subject,
        html,
        attachments: options.attachments,
      });

      this.logger.log(`Email sent successfully to: ${options.to}`);
      return {
        messageId: result.messageId,
        status: "sent",
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return {
        messageId: "",
        status: "failed",
        error: error.message,
      };
    }
  }

  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    actionUrl?: string
  ): Promise<EmailResponse> {
    try {
      const html = this.emailTemplateService.generateWelcomeEmail({
        userName,
        userEmail,
        actionUrl,
      });

      const result = await this.nodemailerProvider.sendMail({
        to: userEmail,
        subject: "¡Bienvenido a NutriTeam!",
        html,
      });

      this.logger.log(`Welcome email sent to: ${userEmail}`);
      return {
        messageId: result.messageId,
        status: "sent",
      };
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${userEmail}:`, error);
      return {
        messageId: "",
        status: "failed",
        error: error.message,
      };
    }
  }

  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetUrl: string,
    timeLimit: string = "24 horas"
  ): Promise<EmailResponse> {
    try {
      const html = this.emailTemplateService.generatePasswordResetEmail({
        userName,
        userEmail,
        resetUrl,
        timeLimit,
      });

      const result = await this.nodemailerProvider.sendMail({
        to: userEmail,
        subject: "Restablecer Contraseña - NutriTeam",
        html,
      });

      this.logger.log(`Password reset email sent to: ${userEmail}`);
      return {
        messageId: result.messageId,
        status: "sent",
      };
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${userEmail}:`,
        error
      );
      return {
        messageId: "",
        status: "failed",
        error: error.message,
      };
    }
  }

  async sendPatientInvitationEmail(
    patientEmail: string,
    patientName: string,
    nutritionistName: string,
    invitationUrl: string,
    personalMessage?: string
  ): Promise<EmailResponse> {
    try {
      const html = this.emailTemplateService.generatePatientInvitationEmail({
        userName: patientName,
        userEmail: patientEmail,
        nutritionistName,
        invitationUrl,
        personalMessage,
      });

      const result = await this.nodemailerProvider.sendMail({
        to: patientEmail,
        subject: `Invitación de ${nutritionistName} - NutriTeam`,
        html,
      });

      this.logger.log(`Patient invitation email sent to: ${patientEmail}`);
      return {
        messageId: result.messageId,
        status: "sent",
      };
    } catch (error) {
      this.logger.error(
        `Failed to send patient invitation email to ${patientEmail}:`,
        error
      );
      return {
        messageId: "",
        status: "failed",
        error: error.message,
      };
    }
  }

  async sendPlanUpdateEmail(
    patientEmail: string,
    patientName: string,
    nutritionistName: string,
    planName: string,
    changes?: string[],
    actionUrl?: string
  ): Promise<EmailResponse> {
    try {
      const html = this.emailTemplateService.generatePlanUpdateEmail({
        userName: patientName,
        userEmail: patientEmail,
        nutritionistName,
        planName,
        changes,
        actionUrl,
      });

      const result = await this.nodemailerProvider.sendMail({
        to: patientEmail,
        subject: `Plan Nutricional Actualizado - ${planName}`,
        html,
      });

      this.logger.log(`Plan update email sent to: ${patientEmail}`);
      return {
        messageId: result.messageId,
        status: "sent",
      };
    } catch (error) {
      this.logger.error(
        `Failed to send plan update email to ${patientEmail}:`,
        error
      );
      return {
        messageId: "",
        status: "failed",
        error: error.message,
      };
    }
  }

  async sendAppointmentReminderEmail(
    patientEmail: string,
    patientName: string,
    nutritionistName: string,
    appointmentDate: string,
    appointmentTime: string,
    appointmentType: string,
    actionUrl?: string
  ): Promise<EmailResponse> {
    try {
      const html = this.emailTemplateService.generateAppointmentReminderEmail({
        userName: patientName,
        userEmail: patientEmail,
        nutritionistName,
        appointmentDate,
        appointmentTime,
        appointmentType,
        actionUrl,
      });

      const result = await this.nodemailerProvider.sendMail({
        to: patientEmail,
        subject: `Recordatorio de Cita - ${appointmentDate}`,
        html,
      });

      this.logger.log(`Appointment reminder email sent to: ${patientEmail}`);
      return {
        messageId: result.messageId,
        status: "sent",
      };
    } catch (error) {
      this.logger.error(
        `Failed to send appointment reminder email to ${patientEmail}:`,
        error
      );
      return {
        messageId: "",
        status: "failed",
        error: error.message,
      };
    }
  }

  async sendRecipeRecommendationEmail(
    patientEmail: string,
    patientName: string,
    nutritionistName: string,
    recipeName: string,
    recipeDescription: string,
    cookTime: string,
    calories: number,
    recipeUrl: string
  ): Promise<EmailResponse> {
    try {
      const html = this.emailTemplateService.generateRecipeRecommendationEmail({
        userName: patientName,
        userEmail: patientEmail,
        nutritionistName,
        recipeName,
        recipeDescription,
        cookTime,
        calories,
        recipeUrl,
      });

      const result = await this.nodemailerProvider.sendMail({
        to: patientEmail,
        subject: `Nueva Receta Recomendada - ${recipeName}`,
        html,
      });

      this.logger.log(`Recipe recommendation email sent to: ${patientEmail}`);
      return {
        messageId: result.messageId,
        status: "sent",
      };
    } catch (error) {
      this.logger.error(
        `Failed to send recipe recommendation email to ${patientEmail}:`,
        error
      );
      return {
        messageId: "",
        status: "failed",
        error: error.message,
      };
    }
  }

  // Generic method for sending emails with any template
  async sendTemplateEmail(
    templateName: EmailTemplateName,
    to: string | string[],
    subject: string,
    templateData: Record<string, any>
  ): Promise<EmailResponse> {
    try {
      const html = this.emailTemplateService.renderCustomTemplate(
        templateName,
        templateData
      );

      const result = await this.nodemailerProvider.sendMail({
        to,
        subject,
        html,
      });

      this.logger.log(`Template email sent successfully to: ${to}`);
      return {
        messageId: result.messageId,
        status: "sent",
      };
    } catch (error) {
      this.logger.error(`Failed to send template email to ${to}:`, error);
      return {
        messageId: "",
        status: "failed",
        error: error.message,
      };
    }
  }

  // Test email service connection
  async testConnection(): Promise<boolean> {
    try {
      await this.nodemailerProvider.verifyConnection();
      this.logger.log("Email service connection verified successfully");
      return true;
    } catch (error) {
      this.logger.error("Email service connection failed:", error);
      return false;
    }
  }

  // Get available templates
  getAvailableTemplates(): EmailTemplateName[] {
    return this.emailTemplateService.getAvailableTemplates();
  }
}
