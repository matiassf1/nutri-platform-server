import { EmailTemplateName } from "@/messaging/types/email.types";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CurrentUser,
  CurrentUserType,
} from "../../common/decorators/current-user.decorator";
import { ResponseService } from "../../common/services/response.service";
import { EmailService as MessagingEmailService } from "../../messaging/services/email.service";
import { SendEmailDto } from "./dto";
import { NotificationsService } from "./notifications.service";

@ApiTags("Notifications")
@Controller("notifications")
@ApiBearerAuth("JWT-auth")
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: MessagingEmailService,
    private readonly responseService: ResponseService
  ) {}

  @Post("send-email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send email notification" })
  @ApiResponse({
    status: 200,
    description: "Email sent successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async sendEmail(
    @Body() sendEmailDto: SendEmailDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.notificationsService.sendEmail(sendEmailDto);
    return this.responseService.success(result, "Email sent successfully");
  }

  @Post("test-email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Test email service connection" })
  @ApiResponse({
    status: 200,
    description: "Test email sent successfully",
  })
  @ApiResponse({ status: 500, description: "Email service error" })
  async testEmail(@CurrentUser() user: CurrentUserType) {
    try {
      const result = await this.emailService.sendTemplateEmail(
        EmailTemplateName.BASE_EMAIL,
        user.email,
        "NutriTeam - Email Service Test",
        {
          userName: user.name,
          userEmail: user.email,
          title: "Email Service Test",
          message: `Hello ${user.name}, this is a test email to verify that the NutriTeam email service is working correctly. If you received this email, the Nodemailer configuration is working properly!`,
          actionText: "Visit NutriTeam",
          actionUrl: "https://nutriteam.com",
        }
      );

      return this.responseService.success(
        result,
        "Test email sent successfully"
      );
    } catch (error) {
      return this.responseService.error(
        "Failed to send test email",
        error.message
      );
    }
  }

  @Get("templates")
  @ApiOperation({ summary: "Get available email templates" })
  @ApiResponse({
    status: 200,
    description: "Available email templates",
  })
  async getTemplates() {
    const templates = [
      {
        name: EmailTemplateName.WELCOME,
        description: "Welcome email for new users",
        method: "sendWelcomeEmail",
        parameters: ["userEmail", "userName"],
      },
      {
        name: EmailTemplateName.PASSWORD_RESET,
        description: "Password reset email",
        method: "sendPasswordResetEmail",
        parameters: ["userEmail", "userName", "resetToken"],
      },
      {
        name: EmailTemplateName.PLAN_UPDATE,
        description: "Nutrition plan update notification",
        method: "sendPlanUpdateNotification",
        parameters: [
          "patientEmail",
          "patientName",
          "nutritionistName",
          "planName",
          "changes?",
          "actionUrl?",
        ],
      },
      {
        name: EmailTemplateName.PATIENT_INVITATION,
        description: "Patient invitation from nutritionist",
        method: "sendPatientInvitation",
        parameters: [
          "patientEmail",
          "patientName",
          "nutritionistName",
          "invitationUrl",
          "personalMessage?",
        ],
      },
      {
        name: EmailTemplateName.APPOINTMENT_REMINDER,
        description: "Appointment reminder",
        method: "sendAppointmentReminder",
        parameters: [
          "patientEmail",
          "patientName",
          "nutritionistName",
          "appointmentDate",
          "appointmentTime",
          "appointmentType",
          "actionUrl?",
        ],
      },
      {
        name: EmailTemplateName.RECIPE_RECOMMENDATION,
        description: "Recipe recommendation",
        method: "sendRecipeRecommendation",
        parameters: [
          "patientEmail",
          "patientName",
          "nutritionistName",
          "recipeName",
          "recipeDescription",
          "cookTime",
          "calories",
          "recipeUrl",
        ],
      },
    ];

    return this.responseService.success(templates, "Available email templates");
  }
}
