import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CurrentUser,
  CurrentUserType,
} from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { ResponseService } from "../../common/services/response.service";
import { UpdateUserDto, UpdateUserProfileDto } from "./dto";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller("users")
@ApiBearerAuth("JWT-auth")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseService: ResponseService
  ) {}

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({
    status: 200,
    description: "Profile retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getProfile(@CurrentUser() user: CurrentUserType) {
    const profile = await this.usersService.getProfile(user.id);
    return this.responseService.success(
      profile,
      "Profile retrieved successfully"
    );
  }

  @Put("profile")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update user profile" })
  @ApiResponse({
    status: 200,
    description: "Profile updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateProfile(
    @CurrentUser() user: CurrentUserType,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const updatedProfile = await this.usersService.updateProfile(
      user.id,
      updateUserDto
    );
    return this.responseService.updated(
      updatedProfile,
      "Profile updated successfully"
    );
  }

  @Put("profile/details")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update user profile details" })
  @ApiResponse({
    status: 200,
    description: "Profile details updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateUserProfile(
    @CurrentUser() user: CurrentUserType,
    @Body() updateProfileDto: UpdateUserProfileDto
  ) {
    const updatedProfile = await this.usersService.updateUserProfile(
      user.id,
      updateProfileDto
    );
    return this.responseService.updated(
      updatedProfile,
      "Profile details updated successfully"
    );
  }

  @Get("patients")
  @Roles("PRO", "ADMIN")
  @ApiOperation({ summary: "Get nutritionist patients (PRO only)" })
  @ApiResponse({
    status: 200,
    description: "Patients retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  async getPatients(@CurrentUser() user: CurrentUserType) {
    const patients = await this.usersService.getPatients(user.id);
    return this.responseService.success(
      patients,
      "Patients retrieved successfully"
    );
  }

  @Get("patients/:id")
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
  async getPatientById(
    @Param("id") patientId: string,
    @CurrentUser() user: CurrentUserType
  ) {
    const patient = await this.usersService.getPatientById(patientId, user.id);
    return this.responseService.success(
      patient,
      "Patient retrieved successfully"
    );
  }

  @Put("patients/:id/assign")
  @Roles("PRO", "ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Assign patient to nutritionist (PRO only)" })
  @ApiParam({ name: "id", description: "Patient ID" })
  @ApiResponse({
    status: 200,
    description: "Patient assigned successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  @ApiResponse({ status: 404, description: "Patient not found" })
  async assignPatient(
    @Param("id") patientId: string,
    @CurrentUser() user: CurrentUserType
  ) {
    const patient = await this.usersService.assignPatient(patientId, user.id);
    return this.responseService.updated(
      patient,
      "Patient assigned successfully"
    );
  }

  @Put("patients/:id/unassign")
  @Roles("PRO", "ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Unassign patient from nutritionist (PRO only)" })
  @ApiParam({ name: "id", description: "Patient ID" })
  @ApiResponse({
    status: 200,
    description: "Patient unassigned successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  @ApiResponse({ status: 404, description: "Patient not found" })
  async unassignPatient(
    @Param("id") patientId: string,
    @CurrentUser() user: CurrentUserType
  ) {
    const patient = await this.usersService.unassignPatient(patientId, user.id);
    return this.responseService.updated(
      patient,
      "Patient unassigned successfully"
    );
  }

  @Get("overview")
  @Roles("PRO", "ADMIN")
  @ApiOperation({ summary: "Get professional overview statistics (PRO only)" })
  @ApiResponse({
    status: 200,
    description: "Overview statistics retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - PRO role required" })
  async getOverview(@CurrentUser() user: CurrentUserType) {
    const overview = await this.usersService.getOverview(user.id);
    return this.responseService.success(
      overview,
      "Overview statistics retrieved successfully"
    );
  }

  @Post("profile/avatar")
  @UseInterceptors(FileInterceptor("avatar"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload user avatar" })
  @ApiResponse({
    status: 201,
    description: "Avatar uploaded successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid file" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async uploadAvatar(
    @UploadedFile() file: any,
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.usersService.uploadAvatar(user.id, file);
    return this.responseService.created(result, "Avatar uploaded successfully");
  }

  @Delete("profile/avatar")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete user avatar" })
  @ApiResponse({
    status: 200,
    description: "Avatar deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async deleteAvatar(@CurrentUser() user: CurrentUserType) {
    const result = await this.usersService.deleteAvatar(user.id);
    return this.responseService.success(result, "Avatar deleted successfully");
  }
}
