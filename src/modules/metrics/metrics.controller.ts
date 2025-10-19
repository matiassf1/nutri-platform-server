import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CurrentUser,
  CurrentUserType,
} from "../../common/decorators/current-user.decorator";
import { ResponseService } from "../../common/services/response.service";
import { CreateMetricDto, FindAllMetricsDto } from "./dto";
import { MetricsService } from "./metrics.service";

@ApiTags("Metrics")
@Controller("metrics")
@ApiBearerAuth("JWT-auth")
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly responseService: ResponseService
  ) {}

  @Get()
  @ApiOperation({ summary: "Get progress metrics with filters" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page",
  })
  @ApiQuery({
    name: "patientId",
    required: false,
    type: String,
    description: "Filter by patient ID",
  })
  @ApiQuery({
    name: "type",
    required: false,
    enum: [
      "WEIGHT",
      "BMI",
      "BODY_FAT",
      "MUSCLE_MASS",
      "WAIST",
      "HIP",
      "CUSTOM",
    ],
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    description: "Start date filter",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    description: "End date filter",
  })
  @ApiResponse({
    status: 200,
    description: "Metrics retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll(
    @Query() query: FindAllMetricsDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.metricsService.findAll(query, user);
    return this.responseService.successWithPagination(
      result.data,
      result.pagination,
      "Metrics retrieved successfully"
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create new progress metric" })
  @ApiResponse({
    status: 201,
    description: "Metric created successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - You can only add metrics for your patients",
  })
  async create(
    @Body() createMetricDto: CreateMetricDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const metric = await this.metricsService.create(createMetricDto, user);
    return this.responseService.created(metric, "Metric created successfully");
  }

  @Get("stats/:patientId")
  @ApiOperation({ summary: "Get patient progress statistics" })
  @ApiParam({ name: "patientId", description: "Patient ID" })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Access denied" })
  @ApiResponse({ status: 404, description: "Patient not found" })
  async getStats(
    @Param("patientId") patientId: string,
    @CurrentUser() user: CurrentUserType
  ) {
    const stats = await this.metricsService.getStats(patientId, user);
    return this.responseService.success(
      stats,
      "Statistics retrieved successfully"
    );
  }
}
