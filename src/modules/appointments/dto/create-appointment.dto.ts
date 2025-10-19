import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateAppointmentDto {
  @ApiProperty({
    description: "Patient ID",
    example: "clx1234567890abcdef",
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: "Appointment date",
    example: "2024-12-15",
    type: "string",
    format: "date",
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: "Appointment time",
    example: "14:30",
    pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
  })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({
    description: "Type of appointment",
    enum: ["INITIAL_CONSULTATION", "FOLLOW_UP", "REVIEW", "EMERGENCY"],
    example: "INITIAL_CONSULTATION",
  })
  @IsEnum(["INITIAL_CONSULTATION", "FOLLOW_UP", "REVIEW", "EMERGENCY"])
  type: string;

  @ApiProperty({
    description: "Duration in minutes",
    example: 60,
    minimum: 15,
    maximum: 240,
  })
  @IsNumber()
  @Min(15)
  @Max(240)
  duration: number;

  @ApiProperty({
    description: "Additional notes",
    example: "Patient prefers morning appointments",
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
