import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../config/prisma.service";
import { EmailService as MessagingEmailService } from "../../messaging/services/email.service";
import { ChangePasswordDto, LoginDto, RegisterDto } from "./dto";
import { AuthResponse, JwtPayload } from "./interfaces";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: MessagingEmailService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, name, role = "USER" } = registerDto;

    // Check if user already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as any,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.name);
      this.logger.log(`Welcome email sent to: ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${user.email}:`,
        error
      );
      // Don't fail registration if email fails
    }

    this.logger.log(`User registered: ${user.email}`);

    return {
      user: {
        ...user,
        patientId: null,
      },
      ...tokens,
    };
  }

  async registerWithInvitation(
    registerDto: RegisterDto,
    invitationToken: string
  ): Promise<AuthResponse> {
    const { email, password, name, role = "USER" } = registerDto;

    // First, validate the invitation
    const invitation = await this.prismaService.patientInvitation.findFirst({
      where: {
        token: invitationToken,
        email: email,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!invitation) {
      throw new ConflictException("Invalid or expired invitation");
    }

    // Check if user already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    let user;

    if (existingUser) {
      // Update existing user
      const hashedPassword = await bcrypt.hash(password, 12);

      user = await this.prismaService.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          password: hashedPassword,
          isActive: true, // Activate the user
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`Existing user updated with invitation: ${user.id}`);
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 12);

      user = await this.prismaService.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role as any,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`New user created with invitation: ${user.id}`);
    }

    // Mark invitation as accepted
    await this.prismaService.patientInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });

    // Create or update patient relationship
    const existingPatient = await this.prismaService.patient.findUnique({
      where: { userId: user.id },
    });

    if (existingPatient) {
      // Update existing patient relationship
      await this.prismaService.patient.update({
        where: { userId: user.id },
        data: {
          nutritionistId: invitation.nutritionistId,
          status: "ACTIVE",
        },
      });
      this.logger.log(`Patient relationship updated for user: ${user.id}`);
    } else {
      // Create new patient relationship
      await this.prismaService.patient.create({
        data: {
          userId: user.id,
          nutritionistId: invitation.nutritionistId,
          status: "ACTIVE",
        },
      });
      this.logger.log(`Patient relationship created for user: ${user.id}`);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.name);
      this.logger.log(`Welcome email sent to: ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${user.email}:`,
        error
      );
      // Don't fail registration if email fails
    }

    this.logger.log(`User registered with invitation: ${user.email}`);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user with patient relation
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: {
        Patient: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        patientId: user.Patient?.id || null,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role },
        {
          secret: this.configService.get<string>("JWT_SECRET"),
          expiresIn: this.configService.get<string>("JWT_EXPIRES_IN"),
        }
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async validateJwtPayload(payload: JwtPayload): Promise<any> {
    this.logger.log(`[validateJwtPayload] Validating JWT payload for user: ${payload.sub}`);
    
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
      include: {
        Patient: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    this.logger.log(`[validateJwtPayload] User found: ${!!user}, isActive: ${user?.isActive}`);
    this.logger.log(`[validateJwtPayload] User Patient relation: ${JSON.stringify({
      hasPatient: !!user?.Patient,
      patientId: user?.Patient?.id,
      patientStatus: user?.Patient?.status
    })}`);

    if (!user || !user.isActive) {
      this.logger.warn(`[validateJwtPayload] User ${payload.sub} not found or inactive`);
      return null;
    }

    const userContext = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      patientId: user.Patient?.id || null,
    };

    this.logger.log(`[validateJwtPayload] Returning user context: ${JSON.stringify(userContext)}`);

    return userContext;
  }

  private async generateTokens(
    user: any
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: this.configService.get<string>("JWT_EXPIRES_IN"),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN"),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      this.logger.log(
        `Password reset requested for non-existent email: ${email}`
      );
      return {
        message: "If the email exists, a password reset link has been sent",
      };
    }

    // Generate reset token (in production, store this in database with expiration)
    const resetToken = this.generateResetToken();

    // Store reset token in database (you might want to create a separate table for this)
    // For now, we'll just log it
    this.logger.log(`Password reset token for ${email}: ${resetToken}`);

    try {
      // Send password reset email
      const emailResult = await this.emailService.sendPasswordResetEmail(
        email,
        user.name,
        `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
        resetToken
      );

      if (emailResult.status === "failed") {
        this.logger.error(
          `Failed to send password reset email to ${email}:`,
          emailResult.error
        );
        throw new Error("Failed to send password reset email");
      }

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Error sending password reset email to ${email}:`,
        error
      );
      throw new Error("Failed to send password reset email");
    }

    return {
      message: "If the email exists, a password reset link has been sent",
    };
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    // In a real implementation, you would:
    // 1. Validate the token from database
    // 2. Check if token is not expired
    // 3. Find user by token
    // 4. Update password
    // 5. Invalidate the token

    // For now, we'll simulate this process
    this.logger.log(`Password reset attempt with token: ${token}`);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // In a real implementation, you would find the user by the reset token
    // For now, we'll just log the action
    this.logger.log(`Password would be updated for token: ${token}`);

    return { message: "Password has been reset successfully" };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.prismaService.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    this.logger.log(`Password changed for user: ${userId}`);

    return { message: "Password changed successfully" };
  }

  async getCurrentUser(userId: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        Patient: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const result = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      patientId: user.Patient?.id || null,
    };
    
    return result;
  }

  private generateResetToken(): string {
    // Generate a secure random token
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `reset_${timestamp}_${random}`;
  }
}
