import { Injectable, Logger } from '@nestjs/common';
import { CurrentUserType } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findAll(
    query: {
      page?: number;
      limit?: number;
      action?: string;
      model?: string;
      actorId?: string;
      startDate?: string;
      endDate?: string;
    },
    user: CurrentUserType,
  ) {
    const { page = 1, limit = 20, action, model, actorId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // If not admin, only show logs for the current user
    if (user.role !== 'ADMIN') {
      where.actorId = user.id;
    } else if (actorId) {
      where.actorId = actorId;
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    if (model) {
      where.model = { contains: model, mode: 'insensitive' };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      this.prismaService.auditLog.findMany({
        where,
        include: {
          actor: {
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
          createdAt: 'desc',
        },
      }),
      this.prismaService.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create an audit log entry
   */
  async create(data: {
    actorId?: string;
    action: string;
    model: string;
    modelId?: string;
    diff?: Record<string, unknown>;
  }) {
    return this.prismaService.auditLog.create({
      data: {
        actorId: data.actorId || null,
        action: data.action,
        model: data.model,
        modelId: data.modelId || null,
        diff: data.diff as any || null,
      },
    });
  }
}
