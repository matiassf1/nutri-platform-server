import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";
import { EmailTemplateName } from "../../../messaging/types/email.types";

export class SendEmailDto {
  @ApiProperty({
    description: "Recipient email address",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Must be a valid email address" })
  @IsNotEmpty({ message: "Recipient email is required" })
  to: string;

  @ApiProperty({
    description: "Email subject",
    example: "Welcome to Nutrition Platform",
  })
  @IsString({ message: "Subject must be a string" })
  @IsNotEmpty({ message: "Subject is required" })
  subject: string;

  @ApiProperty({
    description: "Email template name",
    example: "welcome",
    required: false,
  })
  @IsOptional()
  @IsEnum(EmailTemplateName, {
    message: "Template must be a valid template name",
  })
  template?: EmailTemplateName;

  @ApiProperty({
    description: "Email content (if no template)",
    example: "Welcome to our platform!",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Content must be a string" })
  content?: string;

  @ApiProperty({
    description: "Template data",
    example: { name: "John Doe", planName: "Weight Loss Plan" },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: "Data must be an object" })
  data?: Record<string, any>;
}
