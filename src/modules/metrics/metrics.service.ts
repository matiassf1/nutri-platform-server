import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { CurrentUserType } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../config/prisma.service";
import { CreateMetricDto, FindAllMetricsDto } from "./dto";

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: FindAllMetricsDto, user: CurrentUserType) {
    const { page = 1, limit = 10, patientId, type, startDate, endDate } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (patientId) {
      where.patientId = patientId;
    } else if (user.role !== "ADMIN") {
      // If no patientId specified and user is not admin, get their own metrics
      where.patientId = user.id;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [metrics, total] = await Promise.all([
      this.prismaService.progressMetric.findMany({
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
          recorder: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          date: "desc",
        },
      }),
      this.prismaService.progressMetric.count({ where }),
    ]);

    return {
      data: metrics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(createMetricDto: CreateMetricDto, user: CurrentUserType) {
    const { patientId, ...metricData } = createMetricDto;

    // Verify patient exists and user has access
    if (user.role !== "ADMIN") {
      const patient = await this.prismaService.patient.findFirst({
        where: {
          id: patientId,
          nutritionistId: user.id,
        },
      });

      if (!patient) {
        throw new ForbiddenException(
          "You can only add metrics for your patients"
        );
      }
    }

    const metric = await this.prismaService.progressMetric.create({
      data: {
        ...metricData,
        recordedBy: user.id,
        patientId,
        userId: user.id,
        date: new Date(metricData.date),
      },
    });

    this.logger.log(`Metric created: ${metric.id} by user: ${user.id}`);

    return metric;
  }

  async getStats(patientId: string, user: CurrentUserType) {
    // Verify patient exists and user has access
    if (user.role !== "ADMIN") {
      const patient = await this.prismaService.patient.findFirst({
        where: {
          id: patientId,
          nutritionistId: user.id,
        },
      });

      if (!patient) {
        throw new ForbiddenException("You do not have access to this patient");
      }
    }

    const [weightMetrics, bmiMetrics, bodyFatMetrics] = await Promise.all([
      this.prismaService.progressMetric.findMany({
        where: {
          patientId,
          type: "WEIGHT",
        },
        orderBy: {
          date: "asc",
        },
      }),
      this.prismaService.progressMetric.findMany({
        where: {
          patientId,
          type: "BMI",
        },
        orderBy: {
          date: "asc",
        },
      }),
      this.prismaService.progressMetric.findMany({
        where: {
          patientId,
          type: "BODY_FAT",
        },
        orderBy: {
          date: "asc",
        },
      }),
    ]);

    return {
      weight: {
        current: weightMetrics[weightMetrics.length - 1]?.value || null,
        trend: this.calculateTrend(weightMetrics),
        data: weightMetrics,
      },
      bmi: {
        current: bmiMetrics[bmiMetrics.length - 1]?.value || null,
        trend: this.calculateTrend(bmiMetrics),
        data: bmiMetrics,
      },
      bodyFat: {
        current: bodyFatMetrics[bodyFatMetrics.length - 1]?.value || null,
        trend: this.calculateTrend(bodyFatMetrics),
        data: bodyFatMetrics,
      },
    };
  }

  private calculateTrend(metrics: any[]): "up" | "down" | "stable" {
    if (metrics.length < 2) return "stable";

    const recent = metrics.slice(-3);
    const first = recent[0]?.value;
    const last = recent[recent.length - 1]?.value;

    if (!first || !last) return "stable";

    const change = ((last - first) / first) * 100;

    if (change > 2) return "up";
    if (change < -2) return "down";
    return "stable";
  }
}
