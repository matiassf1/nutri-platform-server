import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { plainToClassFromExist } from "class-transformer";
import { CurrentUserType } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../config/prisma.service";
import {
  AppointmentDto,
  CreateAppointmentDto,
  FindAllAppointmentsDto,
  UpdateAppointmentDto,
} from "./dto";

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: FindAllAppointmentsDto, user: CurrentUserType) {
    const { page, limit, search, patientId, date, status, type } = query;
    const skip = (page - 1) * limit;

    // Construir filtros dinámicos
    const where: any = {
      nutritionistId: user.id,
    };

    if (search) {
      where.OR = [
        {
          patient: {
            user: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          type: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    if (status && status.length > 0) {
      where.status = {
        in: status,
      };
    }

    if (type && type.length > 0) {
      where.type = {
        in: type,
      };
    }

    try {
      const [appointments, total] = await Promise.all([
        (this.prismaService as any).appointment.findMany({
          where,
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
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
          orderBy: [{ date: "asc" }, { time: "asc" }],
          skip,
          take: limit,
        }),
        (this.prismaService as any).appointment.count({ where }),
      ]);

      const appointmentsDto = appointments.map((appointment) =>
        this.formatAppointmentResponse(appointment)
      );

      return {
        data: appointmentsDto,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error("Error fetching appointments:", error);
      throw new BadRequestException("Failed to fetch appointments");
    }
  }

  async findOne(id: string, user: CurrentUserType) {
    try {
      const appointment = await (
        this.prismaService as any
      ).appointment.findFirst({
        where: {
          id,
          nutritionistId: user.id,
        },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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

      if (!appointment) {
        throw new NotFoundException("Appointment not found");
      }

      return this.formatAppointmentResponse(appointment);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error("Error fetching appointment:", error);
      throw new BadRequestException("Failed to fetch appointment");
    }
  }

  async create(createDto: CreateAppointmentDto, user: CurrentUserType) {
    // Verificar que el paciente existe y pertenece al nutricionista
    const patient = await this.prismaService.patient.findFirst({
      where: {
        id: createDto.patientId,
        nutritionistId: user.id,
      },
    });

    if (!patient) {
      throw new NotFoundException("Patient not found or not assigned to you");
    }

    // Verificar que no hay conflicto de horarios
    const appointmentDate = new Date(createDto.date);
    const existingAppointment = await (
      this.prismaService as any
    ).appointment.findFirst({
      where: {
        nutritionistId: user.id,
        date: appointmentDate,
        time: createDto.time,
        status: {
          not: "CANCELLED",
        },
      },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        "You already have an appointment at this time"
      );
    }

    try {
      const appointment = await (this.prismaService as any).appointment.create({
        data: {
          patientId: createDto.patientId,
          nutritionistId: user.id,
          date: appointmentDate,
          time: createDto.time,
          type: createDto.type,
          duration: createDto.duration,
          notes: createDto.notes,
        },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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

      this.logger.log(
        `Appointment created: ${appointment.id} for patient: ${createDto.patientId}`
      );

      return this.formatAppointmentResponse(appointment);
    } catch (error) {
      this.logger.error("Error creating appointment:", error);
      throw new BadRequestException("Failed to create appointment");
    }
  }

  async update(
    id: string,
    updateDto: UpdateAppointmentDto,
    user: CurrentUserType
  ) {
    // Verificar que la cita existe y pertenece al nutricionista
    const existingAppointment = await (
      this.prismaService as any
    ).appointment.findFirst({
      where: {
        id,
        nutritionistId: user.id,
      },
    });

    if (!existingAppointment) {
      throw new NotFoundException("Appointment not found");
    }

    // Si se está cambiando la fecha/hora, verificar conflictos
    if (updateDto.date || updateDto.time) {
      const appointmentDate = updateDto.date
        ? new Date(updateDto.date)
        : existingAppointment.date;
      const appointmentTime = updateDto.time || existingAppointment.time;

      const conflictingAppointment = await (
        this.prismaService as any
      ).appointment.findFirst({
        where: {
          id: { not: id },
          nutritionistId: user.id,
          date: appointmentDate,
          time: appointmentTime,
          status: {
            not: "CANCELLED",
          },
        },
      });

      if (conflictingAppointment) {
        throw new BadRequestException(
          "You already have an appointment at this time"
        );
      }
    }

    try {
      const updateData: any = {};

      if (updateDto.date) {
        updateData.date = new Date(updateDto.date);
      }
      if (updateDto.time) {
        updateData.time = updateDto.time;
      }
      if (updateDto.type) {
        updateData.type = updateDto.type as
          | "INITIAL_CONSULTATION"
          | "FOLLOW_UP"
          | "REVIEW"
          | "EMERGENCY";
      }
      if (updateDto.duration) {
        updateData.duration = updateDto.duration;
      }
      if (updateDto.status) {
        updateData.status = updateDto.status as
          | "SCHEDULED"
          | "COMPLETED"
          | "CANCELLED"
          | "RESCHEDULED";
      }
      if (updateDto.notes !== undefined) {
        updateData.notes = updateDto.notes;
      }

      const appointment = await (this.prismaService as any).appointment.update({
        where: { id },
        data: updateData,
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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

      this.logger.log(`Appointment updated: ${id}`);

      return this.formatAppointmentResponse(appointment);
    } catch (error) {
      this.logger.error("Error updating appointment:", error);
      throw new BadRequestException("Failed to update appointment");
    }
  }

  async remove(id: string, user: CurrentUserType) {
    // Verificar que la cita existe y pertenece al nutricionista
    const appointment = await (this.prismaService as any).appointment.findFirst(
      {
        where: {
          id,
          nutritionistId: user.id,
        },
      }
    );

    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    try {
      await (this.prismaService as any).appointment.delete({
        where: { id },
      });

      this.logger.log(`Appointment deleted: ${id}`);

      return { message: "Appointment deleted successfully" };
    } catch (error) {
      this.logger.error("Error deleting appointment:", error);
      throw new BadRequestException("Failed to delete appointment");
    }
  }

  async getStats(user: CurrentUserType) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [
        total,
        todayAppointments,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
      ] = await Promise.all([
        (this.prismaService as any).appointment.count({
          where: { nutritionistId: user.id },
        }),
        (this.prismaService as any).appointment.count({
          where: {
            nutritionistId: user.id,
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
        }),
        (this.prismaService as any).appointment.count({
          where: {
            nutritionistId: user.id,
            date: {
              gte: today,
            },
            status: "SCHEDULED",
          },
        }),
        (this.prismaService as any).appointment.count({
          where: {
            nutritionistId: user.id,
            status: "COMPLETED",
          },
        }),
        (this.prismaService as any).appointment.count({
          where: {
            nutritionistId: user.id,
            status: "CANCELLED",
          },
        }),
      ]);

      return {
        total,
        todayAppointments,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
      };
    } catch (error) {
      this.logger.error("Error fetching appointment stats:", error);
      throw new BadRequestException("Failed to fetch appointment statistics");
    }
  }

  private formatAppointmentResponse(appointment: any): AppointmentDto {
    return plainToClassFromExist(new AppointmentDto(), {
      id: appointment.id,
      patientId: appointment.patientId,
      nutritionistId: appointment.nutritionistId,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      duration: appointment.duration,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      patient: appointment.patient
        ? {
            id: appointment.patient.id,
            user: appointment.patient.user,
          }
        : undefined,
      nutritionist: appointment.nutritionist,
    });
  }
}
