import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePatientMetricDto, UpdatePatientMetricDto, QueryPatientMetricsDto, MetricType } from './dto';
import { CurrentUserType } from '../../common/decorators/current-user.decorator';
import { Prisma } from '@prisma/client';

@Injectable()
export class PatientMetricsService {
  private readonly logger = new Logger(PatientMetricsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(createDto: CreatePatientMetricDto, user: CurrentUserType) {
    // Get user's patient ID
    const userWithPatient = await this.prismaService.user.findUnique({
      where: { id: user.id },
      include: {
        Patient: {
          select: { id: true },
        },
      },
    });

    if (!userWithPatient?.Patient?.id) {
      throw new ForbiddenException('User is not a patient');
    }

    const patientId = createDto.patientId || userWithPatient.Patient.id;

    // Verify the user has access to this patient
    if (user.role !== 'ADMIN' && user.role !== 'PRO' && patientId !== userWithPatient.Patient.id) {
      throw new ForbiddenException('You can only create metrics for yourself');
    }

    const metric = await this.prismaService.patientMetric.create({
      data: {
        type: createDto.type,
        value: createDto.value,
        unit: createDto.unit,
        recordedAt: createDto.recordedAt || new Date(),
        notes: createDto.notes,
        patientId,
        recordedBy: user.id,
      },
      include: {
        patient: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Patient metric created: ${metric.id} for patient ${patientId}`);

    return metric;
  }

  async findAll(query: QueryPatientMetricsDto, user: CurrentUserType) {
    const { type, patientId, startDate, endDate, page = 1, limit = 20 } = query;

    // Get user's patient ID if not provided
    let targetPatientId = patientId;
    if (!targetPatientId) {
      const userWithPatient = await this.prismaService.user.findUnique({
        where: { id: user.id },
        include: {
          Patient: {
            select: { id: true },
          },
        },
      });

      if (userWithPatient?.Patient?.id) {
        targetPatientId = userWithPatient.Patient.id;
      }
    }

    // Build where conditions
    const where: Prisma.PatientMetricWhereInput = {};

    if (targetPatientId) {
      where.patientId = targetPatientId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.recordedAt = {};
      if (startDate) {
        where.recordedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.recordedAt.lte = new Date(endDate);
      }
    }

    // Verify access
    if (user.role !== 'ADMIN' && user.role !== 'PRO') {
      if (!targetPatientId) {
        throw new ForbiddenException('Patient ID is required');
      }

      // Check if user has access to this patient
      const userWithPatient = await this.prismaService.user.findUnique({
        where: { id: user.id },
        include: {
          Patient: {
            select: { id: true },
          },
        },
      });

      if (userWithPatient?.Patient?.id !== targetPatientId) {
        throw new ForbiddenException('You can only view your own metrics');
      }
    }

    const [metrics, total] = await Promise.all([
      this.prismaService.patientMetric.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          recordedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.patientMetric.count({ where }),
    ]);

    return {
      data: metrics,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: CurrentUserType) {
    const metric = await this.prismaService.patientMetric.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!metric) {
      throw new NotFoundException('Metric not found');
    }

    // Check access
    if (user.role !== 'ADMIN' && user.role !== 'PRO') {
      const userWithPatient = await this.prismaService.user.findUnique({
        where: { id: user.id },
        include: {
          Patient: {
            select: { id: true },
          },
        },
      });

      if (userWithPatient?.Patient?.id !== metric.patientId) {
        throw new ForbiddenException('You can only view your own metrics');
      }
    }

    return metric;
  }

  async update(id: string, updateDto: UpdatePatientMetricDto, user: CurrentUserType) {
    const metric = await this.prismaService.patientMetric.findUnique({
      where: { id },
    });

    if (!metric) {
      throw new NotFoundException('Metric not found');
    }

    // Check access
    if (user.role !== 'ADMIN' && user.role !== 'PRO') {
      const userWithPatient = await this.prismaService.user.findUnique({
        where: { id: user.id },
        include: {
          Patient: {
            select: { id: true },
          },
        },
      });

      if (userWithPatient?.Patient?.id !== metric.patientId) {
        throw new ForbiddenException('You can only update your own metrics');
      }
    }

    const updatedMetric = await this.prismaService.patientMetric.update({
      where: { id },
      data: {
        ...updateDto,
        updatedAt: new Date(),
      },
      include: {
        patient: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Patient metric updated: ${id}`);

    return updatedMetric;
  }

  async remove(id: string, user: CurrentUserType) {
    const metric = await this.prismaService.patientMetric.findUnique({
      where: { id },
    });

    if (!metric) {
      throw new NotFoundException('Metric not found');
    }

    // Check access
    if (user.role !== 'ADMIN' && user.role !== 'PRO') {
      const userWithPatient = await this.prismaService.user.findUnique({
        where: { id: user.id },
        include: {
          Patient: {
            select: { id: true },
          },
        },
      });

      if (userWithPatient?.Patient?.id !== metric.patientId) {
        throw new ForbiddenException('You can only delete your own metrics');
      }
    }

    await this.prismaService.patientMetric.delete({
      where: { id },
    });

    this.logger.log(`Patient metric deleted: ${id}`);

    return { message: 'Metric deleted successfully' };
  }

  async getLatestMetrics(patientId: string, user: CurrentUserType) {
    // Check access
    if (user.role !== 'ADMIN' && user.role !== 'PRO') {
      const userWithPatient = await this.prismaService.user.findUnique({
        where: { id: user.id },
        include: {
          Patient: {
            select: { id: true },
          },
        },
      });

      if (userWithPatient?.Patient?.id !== patientId) {
        throw new ForbiddenException('You can only view your own metrics');
      }
    }

    const metrics = await this.prismaService.patientMetric.findMany({
      where: { patientId },
      orderBy: {
        recordedAt: 'desc',
      },
      distinct: ['type'],
      select: {
        id: true,
        type: true,
        value: true,
        unit: true,
        recordedAt: true,
        notes: true,
      },
    });

    return metrics;
  }

  async getMetricHistory(patientId: string, type: MetricType, user: CurrentUserType) {
    // Check access
    if (user.role !== 'ADMIN' && user.role !== 'PRO') {
      const userWithPatient = await this.prismaService.user.findUnique({
        where: { id: user.id },
        include: {
          Patient: {
            select: { id: true },
          },
        },
      });

      if (userWithPatient?.Patient?.id !== patientId) {
        throw new ForbiddenException('You can only view your own metrics');
      }
    }

    const metrics = await this.prismaService.patientMetric.findMany({
      where: {
        patientId,
        type,
      },
      orderBy: {
        recordedAt: 'asc',
      },
      select: {
        id: true,
        value: true,
        unit: true,
        recordedAt: true,
        notes: true,
      },
    });

    return metrics;
  }

  async getMetricStats(patientId: string, user: CurrentUserType) {
    // Check access
    if (user.role !== 'ADMIN' && user.role !== 'PRO') {
      const userWithPatient = await this.prismaService.user.findUnique({
        where: { id: user.id },
        include: {
          Patient: {
            select: { id: true },
          },
        },
      });

      if (userWithPatient?.Patient?.id !== patientId) {
        throw new ForbiddenException('You can only view your own metrics');
      }
    }

    const stats = await this.prismaService.patientMetric.groupBy({
      by: ['type'],
      where: { patientId },
      _count: {
        id: true,
      },
      _avg: {
        value: true,
      },
      _min: {
        value: true,
      },
      _max: {
        value: true,
      },
    });

    return stats;
  }
}
