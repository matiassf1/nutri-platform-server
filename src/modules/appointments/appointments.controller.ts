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
import { Roles } from "../../common/decorators/roles.decorator";
import { ResponseService } from "../../common/services/response.service";
import { AppointmentsService } from "./appointments.service";
import {
  CreateAppointmentDto,
  FindAllAppointmentsDto,
  UpdateAppointmentDto,
} from "./dto";

@ApiTags("Appointments")
@Controller("appointments")
@ApiBearerAuth("JWT-auth")
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly responseService: ResponseService
  ) {}

  @Get()
  @Roles("PRO", "ADMIN")
  @ApiOperation({ summary: "Get all appointments with filters (PRO only)" })
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
    name: "search",
    required: false,
    type: String,
    description: "Search term for patient name or appointment type",
  })
  @ApiQuery({
    name: "patientId",
    required: false,
    type: String,
    description: "Filter by patient ID",
  })
  @ApiQuery({
    name: "date",
    required: false,
    type: String,
    description: "Filter by appointment date (YYYY-MM-DD)",
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"],
    isArray: true,
    description: "Filter by appointment status",
  })
  @ApiQuery({
    name: "type",
    required: false,
    enum: ["INITIAL_CONSULTATION", "FOLLOW_UP", "REVIEW", "EMERGENCY"],
    isArray: true,
    description: "Filter by appointment type",
  })
  @ApiResponse({
    status: 200,
    description: "Appointments retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  async findAll(
    @Query() query: FindAllAppointmentsDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.appointmentsService.findAll(query, user);
    return this.responseService.successWithPagination(
      result.data,
      result.pagination,
      "Appointments retrieved successfully"
    );
  }

  @Get("stats")
  @Roles("PRO", "ADMIN")
  @ApiOperation({ summary: "Get appointment statistics (PRO only)" })
  @ApiResponse({
    status: 200,
    description: "Appointment statistics retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  async getStats(@CurrentUser() user: CurrentUserType) {
    const stats = await this.appointmentsService.getStats(user);
    return this.responseService.success(
      stats,
      "Appointment statistics retrieved successfully"
    );
  }

  @Get(":id")
  @Roles("PRO", "ADMIN")
  @ApiOperation({ summary: "Get appointment by ID (PRO only)" })
  @ApiParam({ name: "id", description: "Appointment ID" })
  @ApiResponse({
    status: 200,
    description: "Appointment retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  async findOne(@Param("id") id: string, @CurrentUser() user: CurrentUserType) {
    const appointment = await this.appointmentsService.findOne(id, user);
    return this.responseService.success(
      appointment,
      "Appointment retrieved successfully"
    );
  }

  @Post()
  @Roles("PRO", "ADMIN")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create new appointment (PRO only)" })
  @ApiResponse({
    status: 201,
    description: "Appointment created successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  @ApiResponse({ status: 404, description: "Patient not found" })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const appointment = await this.appointmentsService.create(
      createAppointmentDto,
      user
    );
    return this.responseService.created(
      appointment,
      "Appointment created successfully"
    );
  }

  @Patch(":id")
  @Roles("PRO", "ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update appointment (PRO only)" })
  @ApiParam({ name: "id", description: "Appointment ID" })
  @ApiResponse({
    status: 200,
    description: "Appointment updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  async update(
    @Param("id") id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const appointment = await this.appointmentsService.update(
      id,
      updateAppointmentDto,
      user
    );
    return this.responseService.updated(
      appointment,
      "Appointment updated successfully"
    );
  }

  @Delete(":id")
  @Roles("PRO", "ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete appointment (PRO only)" })
  @ApiParam({ name: "id", description: "Appointment ID" })
  @ApiResponse({
    status: 200,
    description: "Appointment deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  async remove(@Param("id") id: string, @CurrentUser() user: CurrentUserType) {
    const result = await this.appointmentsService.remove(id, user);
    return this.responseService.success(
      result,
      "Appointment deleted successfully"
    );
  }
}
