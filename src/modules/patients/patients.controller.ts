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
import {
  CreatePatientDto,
  FindAllPatientsDto,
  SendInvitationDto,
  UpdatePatientDto,
} from "./dto";
import { PatientsService } from "./patients.service";

@ApiTags("Patients")
@Controller("patients")
@ApiBearerAuth("JWT-auth")
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly responseService: ResponseService
  ) {}

  @Get()
  @Roles("PRO", "ADMIN")
  @ApiOperation({ summary: "Get all patients with filters (PRO only)" })
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
    description: "Search term",
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["PENDING", "ACTIVE", "INACTIVE"],
  })
  @ApiResponse({
    status: 200,
    description: "Patients retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  async findAll(
    @Query() query: FindAllPatientsDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.patientsService.findAll(query, user);
    return this.responseService.successWithPagination(
      result.data,
      result.pagination,
      "Patients retrieved successfully"
    );
  }

  @Get(":id")
  @Roles("PRO", "ADMIN")
  @ApiOperation({ summary: "Get patient by ID (PRO only)" })
  @ApiParam({ name: "id", description: "Patient ID" })
  @ApiResponse({
    status: 200,
    description: "Patient retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  @ApiResponse({ status: 404, description: "Patient not found" })
  async findOne(@Param("id") id: string, @CurrentUser() user: CurrentUserType) {
    const patient = await this.patientsService.findOne(id, user);
    return this.responseService.success(
      patient,
      "Patient retrieved successfully"
    );
  }

  @Post()
  @Roles("PRO", "ADMIN")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create new patient (PRO only)" })
  @ApiResponse({
    status: 201,
    description: "Patient created successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const patient = await this.patientsService.create(createPatientDto, user);
    return this.responseService.created(
      patient,
      "Patient created successfully"
    );
  }

  @Patch(":id")
  @Roles("PRO", "ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update patient (PRO only)" })
  @ApiParam({ name: "id", description: "Patient ID" })
  @ApiResponse({
    status: 200,
    description: "Patient updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  @ApiResponse({ status: 404, description: "Patient not found" })
  async update(
    @Param("id") id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const patient = await this.patientsService.update(
      id,
      updatePatientDto,
      user
    );
    return this.responseService.updated(
      patient,
      "Patient updated successfully"
    );
  }

  @Delete(":id")
  @Roles("PRO", "ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete patient (PRO only)" })
  @ApiParam({ name: "id", description: "Patient ID" })
  @ApiResponse({
    status: 200,
    description: "Patient deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  @ApiResponse({ status: 404, description: "Patient not found" })
  async remove(@Param("id") id: string, @CurrentUser() user: CurrentUserType) {
    const result = await this.patientsService.remove(id, user);
    return this.responseService.success(result, "Patient deleted successfully");
  }

  @Get("stats")
  @Roles("PRO", "ADMIN")
  @ApiOperation({ summary: "Get patient statistics (PRO only)" })
  @ApiResponse({
    status: 200,
    description: "Patient statistics retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  async getStats(@CurrentUser() user: CurrentUserType) {
    const stats = await this.patientsService.getStats(user.id);
    return this.responseService.success(
      stats,
      "Patient statistics retrieved successfully"
    );
  }

  @Post("send-invitation")
  @Roles("PRO", "ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send invitation to patient (PRO only)" })
  @ApiResponse({
    status: 200,
    description: "Invitation sent successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  @ApiResponse({ status: 404, description: "Patient not found" })
  async sendInvitation(
    @Body() sendInvitationDto: SendInvitationDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.patientsService.sendInvitation(
      sendInvitationDto,
      user
    );
    return this.responseService.success(result, "Invitation sent successfully");
  }
}
