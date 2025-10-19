import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CurrentUser,
  CurrentUserType,
} from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { ResponseService } from "../../common/services/response.service";
import { CreateInvitationDto, InvitationsService } from "./invitations.service";

@ApiTags("Invitations")
@Controller("invitations")
@ApiBearerAuth("JWT-auth")
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
    private readonly responseService: ResponseService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create patient invitation" })
  @ApiResponse({
    status: 201,
    description: "Invitation created successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.invitationsService.createInvitation(
      user.id,
      user.name,
      createInvitationDto
    );
    return this.responseService.success(
      result,
      "Invitación creada exitosamente"
    );
  }

  @Public()
  @Get("validate/:token")
  @ApiOperation({ summary: "Validate invitation token" })
  @ApiResponse({
    status: 200,
    description: "Invitation validated successfully",
  })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  @ApiResponse({ status: 400, description: "Invalid or expired invitation" })
  async validateInvitation(@Param("token") token: string) {
    const result = await this.invitationsService.validateInvitation(token);
    return this.responseService.success(result, "Invitación válida");
  }

  @Post("accept/:token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Accept invitation" })
  @ApiResponse({
    status: 200,
    description: "Invitation accepted successfully",
  })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  @ApiResponse({ status: 400, description: "Invalid or expired invitation" })
  async acceptInvitation(
    @Param("token") token: string,
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.invitationsService.acceptInvitation(
      token,
      user.id
    );
    return this.responseService.success(
      result,
      "Invitación aceptada exitosamente"
    );
  }

  @Get()
  @ApiOperation({ summary: "Get invitations by nutritionist" })
  @ApiResponse({
    status: 200,
    description: "Invitations retrieved successfully",
  })
  async getInvitations(@CurrentUser() user: CurrentUserType) {
    const result = await this.invitationsService.getInvitationsByNutritionist(
      user.id
    );
    return this.responseService.success(
      result,
      "Invitaciones obtenidas exitosamente"
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel invitation" })
  @ApiResponse({
    status: 200,
    description: "Invitation cancelled successfully",
  })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  async cancelInvitation(
    @Param("id") id: string,
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.invitationsService.cancelInvitation(id, user.id);
    return this.responseService.success(
      result,
      "Invitación cancelada exitosamente"
    );
  }

  @Post(":id/resend")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend invitation" })
  @ApiResponse({
    status: 200,
    description: "Invitation resent successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Invitación reenviada exitosamente",
        },
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            token: { type: "string" },
            email: { type: "string" },
            patientName: { type: "string" },
            expiresAt: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "EXPIRED", "CANCELLED"],
            },
          },
        },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  @ApiResponse({ status: 400, description: "Failed to resend invitation" })
  async resendInvitation(
    @Param("id") id: string,
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.invitationsService.resendInvitation(id, user.id);
    return this.responseService.success(
      result,
      "Invitación reenviada exitosamente"
    );
  }
}
