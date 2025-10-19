import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { StorageService } from "../../common/services/storage.service";
import { PrismaService } from "../../config/prisma.service";
import { UpdateUserDto, UpdateUserProfileDto } from "./dto";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService
  ) {}

  async getProfile(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        // Campos profesionales
        phone: true,
        address: true,
        bio: true,
        specialization: true,
        experience: true,
        education: true,
        certifications: true,
        website: true,
        linkedin: true,
        instagram: true,
        consultationFee: true,
        timezone: true,
        language: true,
        availability: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            dietaryRestrictions: true,
            allergies: true,
            goals: true,
            activityLevel: true,
            targetWeight: true,
            currentWeight: true,
            height: true,
            age: true,
            gender: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        // Campos profesionales
        phone: true,
        address: true,
        bio: true,
        specialization: true,
        experience: true,
        education: true,
        certifications: true,
        website: true,
        linkedin: true,
        instagram: true,
        consultationFee: true,
        timezone: true,
        language: true,
        availability: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User profile updated: ${userId}`);

    return updatedUser;
  }

  async updateUserProfile(
    userId: string,
    updateProfileDto: UpdateUserProfileDto
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const updatedProfile = await this.prismaService.userProfile.upsert({
      where: { userId },
      update: updateProfileDto,
      create: {
        user: { connect: { id: userId } },
        activityLevel: updateProfileDto.activityLevel,
        ...updateProfileDto,
      },
      select: {
        dietaryRestrictions: true,
        allergies: true,
        goals: true,
        activityLevel: true,
        targetWeight: true,
        currentWeight: true,
        height: true,
        age: true,
        gender: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User profile details updated: ${userId}`);

    return updatedProfile;
  }

  async getPatients(nutritionistId: string) {
    const patients = await this.prismaService.patient.findMany({
      where: { nutritionistId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            isActive: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return patients;
  }

  async getPatientById(patientId: string, nutritionistId: string) {
    const patient = await this.prismaService.patient.findFirst({
      where: {
        id: patientId,
        nutritionistId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            isActive: true,
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

    return patient;
  }

  async assignPatient(patientId: string, nutritionistId: string) {
    const patient = await this.prismaService.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException("Patient not found");
    }

    if (patient.nutritionistId && patient.nutritionistId !== nutritionistId) {
      throw new ForbiddenException(
        "Patient is already assigned to another nutritionist"
      );
    }

    const updatedPatient = await this.prismaService.patient.update({
      where: { id: patientId },
      data: {
        nutritionistId,
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    this.logger.log(
      `Patient ${patientId} assigned to nutritionist ${nutritionistId}`
    );

    return updatedPatient;
  }

  async unassignPatient(patientId: string, nutritionistId: string) {
    const patient = await this.prismaService.patient.findFirst({
      where: {
        id: patientId,
        nutritionistId,
      },
    });

    if (!patient) {
      throw new NotFoundException("Patient not found or not assigned to you");
    }

    const updatedPatient = await this.prismaService.patient.update({
      where: { id: patientId },
      data: {
        nutritionistId: null,
        status: "PENDING",
      },
    });

    this.logger.log(
      `Patient ${patientId} unassigned from nutritionist ${nutritionistId}`
    );

    return updatedPatient;
  }

  async getOverview(nutritionistId: string) {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Obtener estadísticas en paralelo
    const [
      totalPatients,
      activePatients,
      patientsThisMonth,
      totalPlans,
      plansThisWeek,
      totalRecipes,
      recentPatients,
      upcomingAppointments,
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

      // Pacientes agregados este mes
      this.prismaService.patient.count({
        where: {
          nutritionistId,
          createdAt: { gte: startOfMonth },
        },
      }),

      // Total de planes creados
      this.prismaService.plan.count({
        where: { nutritionistId },
      }),

      // Planes creados esta semana
      this.prismaService.plan.count({
        where: {
          nutritionistId,
          createdAt: { gte: startOfWeek },
        },
      }),

      // Total de recetas creadas
      this.prismaService.recipe.count({
        where: { createdBy: nutritionistId },
      }),

      this.prismaService.patient.findMany({
        where: { nutritionistId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      this.prismaService.appointment.findMany({
        where: {
          nutritionistId,
          date: { gte: startOfToday },
        },
        select: {
          id: true,
          date: true,
          time: true,
          type: true,
          duration: true,
          patientId: true,
          patient: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: "asc",
        },
        take: 5,
      }),
    ]);

    const appointments = await this.prismaService.appointment.findMany({
      where: {
        nutritionistId,
      },
      select: {
        duration: true,
      },
    });

    const averageConsultationTime =
      appointments.reduce((acc, appointment) => acc + appointment.duration, 0) /
      appointments.length;

    const overviewData = {
      metrics: {
        totalPatients,
        activePatients,
        patientsThisMonth,
        totalPlans,
        plansThisWeek,
        totalRecipes,
        averageConsultationTime,
      },
      recentPatients: recentPatients.map((patient) => ({
        id: patient.id,
        name: patient.user.name,
        avatar: patient.user.avatar,
        status: patient.status,
        createdAt: patient.createdAt,
      })),
      upcomingAppointments: upcomingAppointments.map((appointment) => {
        return {
          id: appointment.id,
          patientId: appointment.patientId,
          date: appointment.date,
          time: appointment.time,
          duration: appointment.duration,
          type: appointment.type,
          patient: appointment.patient
            ? {
                id: appointment.patient.id,
                user: appointment.patient.user
                  ? {
                      id: appointment.patient.user.id,
                      name: appointment.patient.user.name,
                      email: appointment.patient.user.email,
                      avatar: appointment.patient.user.avatar,
                    }
                  : null,
              }
            : null,
        };
      }),
    };

    return overviewData;
  }

  async uploadAvatar(userId: string, file: any) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed"
      );
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new BadRequestException("File size too large. Maximum 2MB allowed");
    }

    try {
      // Upload file to storage service
      const uploadResult = await this.storageService.uploadFile(
        file,
        undefined,
        undefined
      );

      // Get current user to check for existing avatar
      const currentUser = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });

      // Delete old avatar if exists
      if (currentUser?.avatar) {
        try {
          // Extract key from URL (assuming URL format: endpoint/bucket/key)
          const urlParts = currentUser.avatar.split("/");
          const key = urlParts[urlParts.length - 1];
          await this.storageService.deleteFile(key);
        } catch (error) {
          this.logger.warn(`Failed to delete old avatar: ${error.message}`);
        }
      }

      // Update user avatar in database
      await this.prismaService.user.update({
        where: { id: userId },
        data: { avatar: uploadResult.url },
      });

      this.logger.log(`Avatar uploaded for user: ${userId}`, {
        key: uploadResult.key,
        url: uploadResult.url,
      });

      return { avatarUrl: uploadResult.url };
    } catch (error) {
      this.logger.error(`Failed to upload avatar for user: ${userId}`, error);
      throw new BadRequestException(
        `Failed to upload avatar: ${error.message}`
      );
    }
  }

  async deleteAvatar(userId: string) {
    try {
      // Get current user to check for existing avatar
      const currentUser = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });

      // Delete avatar from storage if exists
      if (currentUser?.avatar) {
        try {
          // Extract key from URL (assuming URL format: endpoint/bucket/key)
          const urlParts = currentUser.avatar.split("/");
          const key = urlParts[urlParts.length - 1];
          await this.storageService.deleteFile(key);
        } catch (error) {
          this.logger.warn(
            `Failed to delete avatar from storage: ${error.message}`
          );
        }
      }

      // Update user avatar to null in database
      await this.prismaService.user.update({
        where: { id: userId },
        data: { avatar: null },
      });

      this.logger.log(`Avatar deleted for user: ${userId}`);

      return { message: "Avatar deleted successfully" };
    } catch (error) {
      this.logger.error(`Failed to delete avatar for user: ${userId}`, error);
      throw new BadRequestException(
        `Failed to delete avatar: ${error.message}`
      );
    }
  }
}
