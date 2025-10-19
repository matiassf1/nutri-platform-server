import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({
    description: "Current password",
    example: "currentPassword123",
  })
  @IsString({ message: "Current password must be a string" })
  currentPassword: string;

  @ApiProperty({
    description: "New password",
    example: "newPassword123",
    minLength: 8,
  })
  @IsString({ message: "New password must be a string" })
  @MinLength(8, { message: "New password must be at least 8 characters long" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  newPassword: string;
}
