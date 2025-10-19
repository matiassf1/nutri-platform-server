import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { ResponseService } from "../../common/services/response.service";
import { AuthService } from "./auth.service";
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from "./dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService
  ) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: 201,
    description: "User registered successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "User registered successfully" },
        data: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                name: { type: "string" },
                role: { type: "string" },
                isActive: { type: "boolean" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 409, description: "User already exists" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return this.responseService.created(result, "User registered successfully");
  }

  @Public()
  @Post("register-with-invitation")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register or update user with invitation" })
  @ApiResponse({
    status: 201,
    description: "User registered/updated successfully with invitation",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "User registered successfully with invitation",
        },
        data: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                name: { type: "string" },
                role: { type: "string" },
                isActive: { type: "boolean" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 409, description: "Invalid or expired invitation" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async registerWithInvitation(
    @Body() body: { registerDto: RegisterDto; invitationToken: string }
  ) {
    const result = await this.authService.registerWithInvitation(
      body.registerDto,
      body.invitationToken
    );
    return this.responseService.created(
      result,
      "User registered successfully with invitation"
    );
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Login successful" },
        data: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                name: { type: "string" },
                role: { type: "string" },
                isActive: { type: "boolean" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return this.responseService.success(result, "Login successful");
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({
    status: 200,
    description: "Token refreshed successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Token refreshed successfully" },
        data: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
          },
        },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  async refresh(@Body() body: { refreshToken: string }) {
    const result = await this.authService.refreshToken(body.refreshToken);
    return this.responseService.success(result, "Token refreshed successfully");
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Logout user" })
  @ApiResponse({
    status: 200,
    description: "Logout successful",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Logout successful" },
        data: { type: "object", nullable: true },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async logout(@CurrentUser() user: any) {
    // In a real implementation, you might want to blacklist the token
    return this.responseService.success(null, "Logout successful");
  }

  @Post("profile")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({
    status: 200,
    description: "Profile retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Profile retrieved successfully" },
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            name: { type: "string" },
            role: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            patientId: { type: "string", nullable: true },
          },
        },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@CurrentUser() user: any) {
    const userWithPatient = await this.authService.getCurrentUser(user.id);
    return this.responseService.success(userWithPatient, "Profile retrieved successfully");
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset" })
  @ApiResponse({
    status: 200,
    description: "Password reset email sent",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "If the email exists, a password reset link has been sent",
        },
        data: { type: "object" },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(
      forgotPasswordDto.email
    );
    return this.responseService.success(result, result.message);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password with token" })
  @ApiResponse({
    status: 200,
    description: "Password reset successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Password has been reset successfully",
        },
        data: { type: "object" },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Invalid or expired token" })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password
    );
    return this.responseService.success(result, result.message);
  }

  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Change user password" })
  @ApiResponse({
    status: 200,
    description: "Password changed successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Password changed successfully",
        },
        data: { type: "object" },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Current password is incorrect" })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    const result = await this.authService.changePassword(
      user.id,
      changePasswordDto
    );
    return this.responseService.success(result, result.message);
  }
}
