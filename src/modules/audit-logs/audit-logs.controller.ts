import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, CurrentUserType } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResponseService } from '../../common/services/response.service';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@ApiBearerAuth('JWT-auth')
export class AuditLogsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  @Roles('PRO', 'ADMIN')
  @ApiOperation({ summary: 'Get audit logs with filters (PRO/ADMIN only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'action', required: false, type: String, description: 'Filter by action' })
  @ApiQuery({ name: 'model', required: false, type: String, description: 'Filter by model' })
  @ApiQuery({ name: 'actorId', required: false, type: String, description: 'Filter by actor ID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              actorId: { type: 'string' },
              action: { type: 'string' },
              model: { type: 'string' },
              modelId: { type: 'string' },
              diff: { type: 'object' },
              createdAt: { type: 'string', format: 'date-time' },
              actor: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - PRO/ADMIN role required' })
  async findAll(
    @Query() query: {
      page?: number;
      limit?: number;
      action?: string;
      model?: string;
      actorId?: string;
      startDate?: string;
      endDate?: string;
    },
    @CurrentUser() user: CurrentUserType,
  ) {
    const result = await this.auditLogsService.findAll(query, user);
    return this.responseService.successWithPagination(
      result.data,
      result.pagination,
      'Audit logs retrieved successfully',
    );
  }
}
