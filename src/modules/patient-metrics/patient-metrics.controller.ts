import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, CurrentUserType } from '../../common/decorators/current-user.decorator';
import { ResponseService } from '../../common/services/response.service';
import { PatientMetricsService } from './patient-metrics.service';
import {
  CreatePatientMetricDto,
  UpdatePatientMetricDto,
  QueryPatientMetricsDto,
  MetricType,
} from './dto';

@ApiTags('Patient Metrics')
@Controller('patient-metrics')
@ApiBearerAuth('JWT-auth')
export class PatientMetricsController {
  constructor(
    private readonly patientMetricsService: PatientMetricsService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient metric' })
  @ApiResponse({
    status: 201,
    description: 'Metric created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Metric created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            value: { type: 'number' },
            unit: { type: 'string' },
            recordedAt: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
            patientId: { type: 'string' },
            recordedBy: { type: 'string' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createDto: CreatePatientMetricDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const metric = await this.patientMetricsService.create(createDto, user);
    return this.responseService.created(metric, 'Metric created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get patient metrics with filters' })
  @ApiResponse({
    status: 200,
    description: 'Metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Metrics retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string' },
                  value: { type: 'number' },
                  unit: { type: 'string' },
                  recordedAt: { type: 'string', format: 'date-time' },
                  notes: { type: 'string' },
                },
              },
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
              },
            },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query() query: QueryPatientMetricsDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const result = await this.patientMetricsService.findAll(query, user);
    return this.responseService.success(result, 'Metrics retrieved successfully');
  }

  @Get('latest/:patientId')
  @ApiOperation({ summary: 'Get latest metrics for a patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Latest metrics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getLatestMetrics(
    @Param('patientId') patientId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    const metrics = await this.patientMetricsService.getLatestMetrics(patientId, user);
    return this.responseService.success(metrics, 'Latest metrics retrieved successfully');
  }

  @Get('history/:patientId/:type')
  @ApiOperation({ summary: 'Get metric history for a specific type' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiParam({ name: 'type', description: 'Metric type', enum: MetricType })
  @ApiResponse({
    status: 200,
    description: 'Metric history retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getMetricHistory(
    @Param('patientId') patientId: string,
    @Param('type') type: MetricType,
    @CurrentUser() user: CurrentUserType,
  ) {
    const metrics = await this.patientMetricsService.getMetricHistory(patientId, type, user);
    return this.responseService.success(metrics, 'Metric history retrieved successfully');
  }

  @Get('stats/:patientId')
  @ApiOperation({ summary: 'Get metric statistics for a patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Metric statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getMetricStats(
    @Param('patientId') patientId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    const stats = await this.patientMetricsService.getMetricStats(patientId, user);
    return this.responseService.success(stats, 'Metric statistics retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific metric by ID' })
  @ApiParam({ name: 'id', description: 'Metric ID' })
  @ApiResponse({
    status: 200,
    description: 'Metric retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Metric not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    const metric = await this.patientMetricsService.findOne(id, user);
    return this.responseService.success(metric, 'Metric retrieved successfully');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a metric' })
  @ApiParam({ name: 'id', description: 'Metric ID' })
  @ApiResponse({
    status: 200,
    description: 'Metric updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Metric not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePatientMetricDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const metric = await this.patientMetricsService.update(id, updateDto, user);
    return this.responseService.updated(metric, 'Metric updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a metric' })
  @ApiParam({ name: 'id', description: 'Metric ID' })
  @ApiResponse({
    status: 204,
    description: 'Metric deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Metric not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    await this.patientMetricsService.remove(id, user);
    return this.responseService.deleted('Metric deleted successfully');
  }
}
