import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import { PrismaService } from "../../config/prisma.service";
import { EmailService as MessagingEmailService } from "../../messaging/services/email.service";

export interface CreateInvitationDto {
  email: string;
  patientName: string;
  personalMessage?: string;
}

export interface ValidateInvitationDto {
  token: string;
}

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: MessagingEmailService,
    private readonly configService: ConfigService
  ) {}

  async createInvitation(
    nutritionistId: string,
    nutritionistName: string,
    invitationData: CreateInvitationDto
  ) {
    const { email, patientName, personalMessage } = invitationData;

    // Verificar si ya existe una invitación pendiente para este email
    const existingInvitation =
      await this.prismaService.patientInvitation.findFirst({
        where: {
          email,
          status: "PENDING",
          expiresAt: {
            gt: new Date(),
          },
        },
      });

    if (existingInvitation) {
      throw new BadRequestException(
        "Ya existe una invitación pendiente para este email"
      );
    }

    // Generar token único
    const token = this.generateInvitationToken();

    // Calcular fecha de expiración (7 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Crear invitación
    const invitation = await this.prismaService.patientInvitation.create({
      data: {
        token,
        email,
        patientName,
        nutritionistId,
        nutritionistName,
        personalMessage,
        expiresAt,
      },
    });

    // Generar URL de invitación
    const frontendUrl = this.configService.get<string>("FRONTEND_URL");
    const invitationUrl = `${frontendUrl}/register?invitation=true&token=${token}`;

    // Enviar email de invitación
    try {
      const emailResult = await this.emailService.sendPatientInvitationEmail(
        email,
        patientName,
        nutritionistName,
        invitationUrl,
        personalMessage
      );

      if (emailResult.status === "failed") {
        this.logger.error(
          `Failed to send invitation email to ${email}:`,
          emailResult.error
        );
        // No fallar la creación de la invitación si el email falla
      }

      this.logger.log(`Invitation created and email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Error sending invitation email to ${email}:`, error);
      // No fallar la creación de la invitación si el email falla
    }

    return {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      patientName: invitation.patientName,
      expiresAt: invitation.expiresAt,
      status: invitation.status,
    };
  }

  async validateInvitation(token: string) {
    const invitation = await this.prismaService.patientInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException("Invitación no encontrada");
    }

    if (invitation.status !== "PENDING") {
      throw new BadRequestException(
        "Esta invitación ya ha sido utilizada o cancelada"
      );
    }

    if (invitation.expiresAt < new Date()) {
      // Marcar como expirada
      await this.prismaService.patientInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      throw new BadRequestException("Esta invitación ha expirado");
    }

    return {
      id: invitation.id,
      email: invitation.email,
      patientName: invitation.patientName,
      nutritionistId: invitation.nutritionistId,
      nutritionistName: invitation.nutritionistName,
      personalMessage: invitation.personalMessage,
      expiresAt: invitation.expiresAt,
    };
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.validateInvitation(token);

    // Actualizar estado de la invitación
    await this.prismaService.patientInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });

    // Crear relación paciente-nutricionista
    await this.prismaService.patient.create({
      data: {
        userId,
        nutritionistId: invitation.nutritionistId,
        status: "ACTIVE",
      },
    });

    this.logger.log(
      `Invitation accepted by user ${userId} for nutritionist ${invitation.nutritionistId}`
    );

    return {
      message: "Invitación aceptada exitosamente",
      nutritionistId: invitation.nutritionistId,
      nutritionistName: invitation.nutritionistName,
    };
  }

  async getInvitationsByNutritionist(nutritionistId: string) {
    return this.prismaService.patientInvitation.findMany({
      where: { nutritionistId },
      orderBy: { createdAt: "desc" },
    });
  }

  async cancelInvitation(invitationId: string, nutritionistId: string) {
    const invitation = await this.prismaService.patientInvitation.findFirst({
      where: {
        id: invitationId,
        nutritionistId,
        status: "PENDING",
      },
    });

    if (!invitation) {
      throw new NotFoundException("Invitación no encontrada o ya procesada");
    }

    await this.prismaService.patientInvitation.update({
      where: { id: invitationId },
      data: { status: "CANCELLED" },
    });

    this.logger.log(
      `Invitation ${invitationId} cancelled by nutritionist ${nutritionistId}`
    );

    return { message: "Invitación cancelada exitosamente" };
  }

  async resendInvitation(invitationId: string, nutritionistId: string) {
    const invitation = await this.prismaService.patientInvitation.findFirst({
      where: {
        id: invitationId,
        nutritionistId,
        status: "PENDING",
      },
    });

    if (!invitation) {
      throw new NotFoundException("Invitation not found or already processed");
    }

    // Generate new token and extend expiration
    const newToken = this.generateInvitationToken();
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7); // 7 days from now

    // Update invitation with new token and expiration
    const updatedInvitation = await this.prismaService.patientInvitation.update(
      {
        where: { id: invitationId },
        data: {
          token: newToken,
          expiresAt: newExpiresAt,
        },
      }
    );

    // Generate new invitation URL
    const frontendUrl = this.configService.get<string>("FRONTEND_URL");
    const invitationUrl = `${frontendUrl}/register?invitation=true&token=${newToken}`;

    // Send new invitation email
    try {
      const emailResult = await this.emailService.sendPatientInvitationEmail(
        invitation.email,
        invitation.patientName,
        invitation.nutritionistName,
        invitationUrl,
        invitation.personalMessage
      );

      if (emailResult.status === "failed") {
        this.logger.error(
          `Failed to resend invitation email to ${invitation.email}:`,
          emailResult.error
        );
        throw new Error("Failed to send invitation email");
      }

      this.logger.log(`Invitation resent to ${invitation.email}`);
    } catch (error) {
      this.logger.error(
        `Error resending invitation email to ${invitation.email}:`,
        error
      );
      throw new Error("Failed to resend invitation email");
    }

    return {
      message: "Invitación reenviada exitosamente",
      invitation: {
        id: updatedInvitation.id,
        token: updatedInvitation.token,
        email: updatedInvitation.email,
        patientName: updatedInvitation.patientName,
        expiresAt: updatedInvitation.expiresAt,
        status: updatedInvitation.status,
      },
    };
  }

  private generateInvitationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}
