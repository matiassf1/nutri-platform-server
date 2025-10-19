import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as handlebars from "handlebars";
import * as path from "path";
import { BaseEmailTemplate } from "../interfaces/email-templates.interface";
import { EmailTemplateName } from "../types/email.types";

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);
  private readonly templateCache = new Map<
    string,
    HandlebarsTemplateDelegate
  >();

  constructor(private readonly configService: ConfigService) {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    try {
      // Register base template
      this.registerTemplate(EmailTemplateName.BASE_EMAIL);

      // Register specific templates
      this.registerTemplate(EmailTemplateName.WELCOME);
      this.registerTemplate(EmailTemplateName.PASSWORD_RESET);
      this.registerTemplate(EmailTemplateName.PATIENT_INVITATION);
      this.registerTemplate(EmailTemplateName.PLAN_UPDATE);
      this.registerTemplate(EmailTemplateName.APPOINTMENT_REMINDER);
      this.registerTemplate(EmailTemplateName.RECIPE_RECOMMENDATION);

      this.logger.log("Email templates initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize email templates:", error);
    }
  }

  private registerTemplate(templateName: string): void {
    try {
      // Try dist directory first (production), then src directory (development)
      const distPath = path.join(
        __dirname,
        "../email-templates/compiled",
        `${templateName}.template.hbs`
      );

      const srcPath = path.join(
        __dirname,
        "../../../src/messaging/email-templates/compiled",
        `${templateName}.template.hbs`
      );

      // Check which path exists
      let templatePath: string | null = null;

      if (fs.existsSync(distPath)) {
        templatePath = distPath;
        this.logger.debug(`Found template in dist: ${templatePath}`);
      } else if (fs.existsSync(srcPath)) {
        templatePath = srcPath;
        this.logger.debug(`Found template in src: ${templatePath}`);
      }

      if (templatePath) {
        const templateSource = fs.readFileSync(templatePath, "utf8");
        const template = handlebars.compile(templateSource);
        this.templateCache.set(templateName, template);
        this.logger.log(
          `Template ${templateName} registered successfully from: ${templatePath}`
        );
      } else {
        this.logger.warn(`Template file not found in either location:`);
        this.logger.warn(`  Dist: ${distPath}`);
        this.logger.warn(`  Src: ${srcPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to register template ${templateName}:`, error);
    }
  }

  private getBaseTemplateData(): Partial<BaseEmailTemplate> {
    return {
      currentYear: new Date().getFullYear(),
      securityUrl: this.configService.get<string>("FRONTEND_URL") + "/security",
      privacyUrl: this.configService.get<string>("FRONTEND_URL") + "/privacy",
      termsUrl: this.configService.get<string>("FRONTEND_URL") + "/terms",
    };
  }

  generateWelcomeEmail(data: {
    userName: string;
    userEmail: string;
    actionUrl?: string;
  }): string {
    const templateData = {
      ...this.getBaseTemplateData(),
      ...data,
      title: "¡Bienvenido a NutriTeam!",
      message:
        "¡Estamos emocionados de tenerte en NutriTeam! Tu plataforma de nutrición personalizada está lista para ayudarte a alcanzar tus objetivos de salud.",
      actionText: "Comenzar mi plan",
      additionalInfo:
        "Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.",
    };

    return this.renderTemplate(EmailTemplateName.WELCOME, templateData);
  }

  generatePasswordResetEmail(data: {
    userName: string;
    userEmail: string;
    resetUrl: string;
    timeLimit: string;
  }): string {
    const templateData = {
      ...this.getBaseTemplateData(),
      ...data,
      title: "Restablecer Contraseña",
      message:
        "Recibimos una solicitud para restablecer tu contraseña en NutriTeam. Haz clic en el botón de abajo para crear una nueva contraseña segura.",
      actionUrl: data.resetUrl,
      actionText: "Restablecer Contraseña",
      warning: `Este enlace expirará en ${data.timeLimit}`,
      additionalInfo:
        "Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje de forma segura.",
    };

    return this.renderTemplate(EmailTemplateName.PASSWORD_RESET, templateData);
  }

  generatePatientInvitationEmail(data: {
    userName: string;
    userEmail: string;
    nutritionistName: string;
    invitationUrl: string;
    personalMessage?: string;
  }): string {
    const templateData = {
      ...this.getBaseTemplateData(),
      ...data,
      title: "Invitación de tu Nutricionista",
      message: `${data.nutritionistName} te ha invitado a unirte a NutriTeam, una plataforma completa de nutrición donde podrás recibir seguimiento personalizado y alcanzar tus objetivos de salud.`,
      actionUrl: data.invitationUrl,
      actionText: "Aceptar Invitación",
      additionalInfo: `Esta invitación es válida por tiempo limitado. Si tienes alguna pregunta, contacta a ${data.nutritionistName} directamente.`,
    };

    return this.renderTemplate(
      EmailTemplateName.PATIENT_INVITATION,
      templateData
    );
  }

  generatePlanUpdateEmail(data: {
    userName: string;
    userEmail: string;
    nutritionistName: string;
    planName: string;
    changes?: string[];
    actionUrl?: string;
  }): string {
    const templateData = {
      ...this.getBaseTemplateData(),
      ...data,
      title: "Tu Plan Nutricional ha sido Actualizado",
      message: `Tu nutricionista ${data.nutritionistName} ha actualizado tu plan nutricional "${data.planName}" con nuevas recomendaciones y ajustes basados en tu progreso.`,
      actionUrl: data.actionUrl,
      actionText: "Ver Plan Actualizado",
      additionalInfo: `Si tienes alguna pregunta sobre los cambios, no dudes en contactar a ${data.nutritionistName} a través de la plataforma.`,
    };

    return this.renderTemplate(EmailTemplateName.PLAN_UPDATE, templateData);
  }

  generateAppointmentReminderEmail(data: {
    userName: string;
    userEmail: string;
    nutritionistName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentType: string;
    actionUrl?: string;
  }): string {
    const templateData = {
      ...this.getBaseTemplateData(),
      ...data,
      title: "Recordatorio de Cita",
      message: `Tienes una cita programada con ${data.nutritionistName} el ${data.appointmentDate} a las ${data.appointmentTime}.`,
      actionUrl: data.actionUrl,
      actionText: "Ver Detalles de la Cita",
      additionalInfo:
        "Si necesitas reprogramar o cancelar tu cita, hazlo con al menos 24 horas de anticipación.",
    };

    return this.renderTemplate(
      EmailTemplateName.APPOINTMENT_REMINDER,
      templateData
    );
  }

  generateRecipeRecommendationEmail(data: {
    userName: string;
    userEmail: string;
    nutritionistName: string;
    recipeName: string;
    recipeDescription: string;
    cookTime: string;
    calories: number;
    recipeUrl: string;
  }): string {
    const templateData = {
      ...this.getBaseTemplateData(),
      ...data,
      title: "Nueva Receta Recomendada",
      message: `${data.nutritionistName} te ha recomendado una nueva receta: "${data.recipeName}". Esta receta se adapta perfectamente a tu plan nutricional actual.`,
      actionUrl: data.recipeUrl,
      actionText: "Ver Receta Completa",
      additionalInfo: `Tiempo de preparación: ${data.cookTime} | Calorías: ${data.calories}`,
    };

    return this.renderTemplate(
      EmailTemplateName.RECIPE_RECOMMENDATION,
      templateData
    );
  }

  private renderTemplate(templateName: EmailTemplateName, data: any): string {
    this.logger.debug(`Attempting to render template: ${templateName}`);
    this.logger.debug(
      `Available templates: ${Array.from(this.templateCache.keys()).join(", ")}`
    );

    const template = this.templateCache.get(`${templateName}`);
    if (!template) {
      this.logger.error(`Template ${templateName} not found in cache`);
      // Fallback to a simple HTML template instead of recursive call
      return this.getFallbackTemplate(data);
    }

    try {
      return template(data);
    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}:`, error);
      // Fallback to a simple HTML template instead of recursive call
      return this.getFallbackTemplate(data);
    }
  }

  private getFallbackTemplate(data: any): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title || "NutriTeam"}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    .header { text-align: center; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #4CAF50; }
    .content { line-height: 1.6; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">NutriTeam</div>
    </div>
    <div class="content">
      <h2>${data.title || "Notificación"}</h2>
      <p>Hola ${data.userName || "Usuario"},</p>
      <p>${data.message || "Has recibido una notificación de NutriTeam."}</p>
      ${data.actionUrl ? `<p><a href="${data.actionUrl}" style="color: #4CAF50;">${data.actionText || "Hacer clic aquí"}</a></p>` : ""}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} NutriTeam. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>`;
  }

  // Generic template renderer for custom emails
  renderCustomTemplate(templateName: EmailTemplateName, data: any): string {
    return this.renderTemplate(templateName, {
      ...this.getBaseTemplateData(),
      ...data,
    });
  }

  // Get available templates
  getAvailableTemplates(): EmailTemplateName[] {
    return Array.from(this.templateCache.keys()) as EmailTemplateName[];
  }
}
