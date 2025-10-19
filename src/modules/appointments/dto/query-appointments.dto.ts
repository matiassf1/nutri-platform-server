import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class FindAllAppointmentsDto {
  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Items per page",
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Search term for patient name or appointment type",
    example: "John Doe",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by patient ID",
    example: "clx1234567890abcdef",
  })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({
    description: "Filter by appointment date",
    example: "2024-12-15",
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: "Filter by appointment status",
    enum: ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"], {
    each: true,
  })
  status?: string[];

  @ApiPropertyOptional({
    description: "Filter by appointment type",
    enum: ["INITIAL_CONSULTATION", "FOLLOW_UP", "REVIEW", "EMERGENCY"],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(["INITIAL_CONSULTATION", "FOLLOW_UP", "REVIEW", "EMERGENCY"], {
    each: true,
  })
  type?: string[];
}
