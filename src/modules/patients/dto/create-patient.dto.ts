import { ApiProperty } from "@nestjs/swagger";
import { PatientStatus } from "@prisma/client";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreatePatientDto {
  @ApiProperty({
    description: "Patient name",
    example: "Juan Pérez",
  })
  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({ message: "Name is required" })
  @MinLength(2, { message: "Name must be at least 2 characters" })
  name: string;

  @ApiProperty({
    description: "Patient email",
    example: "juan.perez@example.com",
  })
  @IsEmail({}, { message: "Email must be a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @ApiProperty({
    description: "Patient status",
    example: "PENDING",
    enum: ["PENDING", "ACTIVE", "INACTIVE"],
    required: false,
  })
  @IsOptional()
  @IsEnum(PatientStatus, {
    message: "Status must be one of: PENDING, ACTIVE, INACTIVE",
  })
  status?: PatientStatus = PatientStatus.PENDING;

  @ApiProperty({
    description: "Last visit date",
    example: "2024-01-15T10:30:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "Last visit must be a valid date" })
  lastVisit?: string;

  @ApiProperty({
    description: "Next visit date",
    example: "2024-02-15T10:30:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "Next visit must be a valid date" })
  nextVisit?: string;

  @ApiProperty({
    description: "Additional notes about the patient",
    example: "Patient prefers vegetarian meals",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Notes must be a string" })
  notes?: string;
}
