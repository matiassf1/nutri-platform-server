import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SendInvitationDto {
  @ApiProperty({
    description: "Patient email to send invitation to",
    example: "juan.perez@example.com",
  })
  @IsEmail({}, { message: "Email must be a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @ApiProperty({
    description: "Custom message for the invitation",
    example: "Welcome to our nutrition platform! Please complete your profile.",
    required: false,
  })
  @IsString({ message: "Message must be a string" })
  message?: string;
}
