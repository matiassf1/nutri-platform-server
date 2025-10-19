import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUserType } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../config/prisma.service";
import { InvitationsService } from "../invitations/invitations.service";
import {
  CreatePatientDto,
  FindAllPatientsDto,
  SendInvitationDto,
  UpdatePatientDto,
} from "./dto";

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly invitationsService: InvitationsService
  ) {}

  async findAll(query: FindAllPatientsDto, user: CurrentUserType) {
    const { page = 1, limit = 10, search, status } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // If user is not admin, filter by their patients
    if (user.role !== "ADMIN") {
      where.nutritionistId = user.id;
    }

    if (search) {
      where.OR = [
        {
          user: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          user: {
            email: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [patients, total] = await Promise.all([
      this.prismaService.patient.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isActive: true,
            },
          },
          nutritionist: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          medicalRecord: {
            select: {
              personalInfo: true,
              allergies: true,
              dietaryRestrictions: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prismaService.patient.count({ where }),
    ]);

    return {
      data: patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: CurrentUserType) {
    const patient = await this.prismaService.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isActive: true,
          },
        },
        nutritionist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        medicalRecord: {
          include: {
            notes: {
              orderBy: {
                createdAt: "desc",
              },
              take: 10,
            },
            attachments: {
              orderBy: {
                uploadedAt: "desc",
              },
              take: 10,
            },
          },
        },
        plans: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        progressMetric: {
          orderBy: {
            date: "desc",
          },
          take: 10,
        },
      },
    });

    if (!patient) {
      throw new NotFoundException("Patient not found");
    }

    // Check if user has access to this patient
    if (user.role !== "ADMIN" && patient.nutritionistId !== user.id) {
      throw new ForbiddenException("You do not have access to this patient");
    }

    return patient;
  }

  async create(createPatientDto: CreatePatientDto, user: CurrentUserType) {
    const { name, email, ...patientData } = createPatientDto;

    // Check if user already exists with this email
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Check if patient profile already exists
      const existingPatient = await this.prismaService.patient.findUnique({
        where: { userId: existingUser.id },
      });

      if (existingPatient) {
        throw new ForbiddenException(
          "Patient profile already exists for this email"
        );
      }

      // Create patient profile for existing user
      const patient = await this.prismaService.patient.create({
        data: {
          ...patientData,
          nutritionistId: user.id,
          userId: existingUser.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          nutritionist: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Send invitation to existing user
      try {
        await this.invitationsService.createInvitation(user.id, user.name, {
          email: patient.user.email,
          patientName: patient.user.name,
          personalMessage: `Hola ${patient.user.name}, te he agregado como mi paciente en NutriTeam. Por favor, acepta esta invitación para comenzar a trabajar juntos.`,
        });
        this.logger.log(
          `Invitation sent to existing user: ${patient.user.email}`
        );
      } catch (error) {
        this.logger.error(
          `Failed to send invitation to existing user ${patient.user.email}:`,
          error
        );
        // Don't fail patient creation if invitation fails
      }

      return patient;
    }

    // Create new user and patient profile
    const patient = await this.prismaService.$transaction(async (tx) => {
      // Create user account
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          role: "USER" as UserRole,
          isActive: false, // Will be activated when they set password
          // Generate a temporary password that they must change
          password: "TEMP_PASSWORD_" + Math.random().toString(36).substring(7),
        },
      });

      // Create patient profile
      const newPatient = await tx.patient.create({
        data: {
          ...patientData,
          nutritionistId: user.id,
          userId: newUser.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          nutritionist: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return newPatient;
    });

    // Send invitation to new user
    try {
      await this.invitationsService.createInvitation(user.id, user.name, {
        email: patient.user.email,
        patientName: patient.user.name,
        personalMessage: `Hola ${patient.user.name}, te he agregado como mi paciente en NutriTeam. Por favor, acepta esta invitación para comenzar a trabajar juntos.`,
      });
      this.logger.log(`Invitation sent to new user: ${patient.user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send invitation to new user ${patient.user.email}:`,
        error
      );
      // Don't fail patient creation if invitation fails
    }

    this.logger.log(`Patient created: ${patient.id} by user: ${user.id}`);

    return patient;
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    user: CurrentUserType
  ) {
    const existingPatient = await this.prismaService.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      throw new NotFoundException("Patient not found");
    }

    // Check if user has access to update this patient
    if (user.role !== "ADMIN" && existingPatient.nutritionistId !== user.id) {
      throw new ForbiddenException("You can only update your own patients");
    }

    const { userId: _ignoreUserId, ...patientUpdateData } =
      updatePatientDto as any;
    const patient = await this.prismaService.patient.update({
      where: { id },
      data: patientUpdateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        nutritionist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(`Patient updated: ${id} by user: ${user.id}`);

    return patient;
  }

  async remove(id: string, user: CurrentUserType) {
    const existingPatient = await this.prismaService.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      throw new NotFoundException("Patient not found");
    }

    // Check if user has access to delete this patient
    if (user.role !== "ADMIN" && existingPatient.nutritionistId !== user.id) {
      throw new ForbiddenException("You can only delete your own patients");
    }

    // Soft delete
    await this.prismaService.patient.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    this.logger.log(`Patient deleted: ${id} by user: ${user.id}`);

    return { message: "Patient deleted successfully" };
  }

  async getStats(nutritionistId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPatients,
      activePatients,
      inactivePatients,
      pendingPatients,
      patientsThisMonth,
    ] = await Promise.all([
      // Total de pacientes
      this.prismaService.patient.count({
        where: { nutritionistId },
      }),

      // Pacientes activos
      this.prismaService.patient.count({
        where: {
          nutritionistId,
          status: "ACTIVE",
        },
      }),

      // Pacientes inactivos
      this.prismaService.patient.count({
        where: {
          nutritionistId,
          status: "INACTIVE",
        },
      }),

      // Pacientes pendientes
      this.prismaService.patient.count({
        where: {
          nutritionistId,
          status: "PENDING",
        },
      }),

      // Pacientes agregados este mes
      this.prismaService.patient.count({
        where: {
          nutritionistId,
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    return {
      total: totalPatients,
      active: activePatients,
      inactive: inactivePatients,
      pending: pendingPatients,
      thisMonth: patientsThisMonth,
    };
  }

  async sendInvitation(
    sendInvitationDto: SendInvitationDto,
    user: CurrentUserType
  ) {
    const { email, message } = sendInvitationDto;

    // Find patient by email
    const patient = await this.prismaService.patient.findFirst({
      where: {
        user: { email },
        nutritionistId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException("Patient not found");
    }

    if (patient.user.isActive) {
      throw new ForbiddenException("Patient is already active");
    }

    // Use invitations service to create invitation
    const invitation = await this.invitationsService.createInvitation(
      user.id,
      user.name,
      {
        email: patient.user.email,
        patientName: patient.user.name,
        personalMessage: message,
      }
    );

    return {
      success: true,
      message: "Invitation sent successfully",
      invitationId: invitation.id,
      token: invitation.token,
      patient: {
        id: patient.id,
        name: patient.user.name,
        email: patient.user.email,
      },
    };
  }
}
