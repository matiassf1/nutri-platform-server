import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class FindAllPlansDto {
  @ApiProperty({
    description: "Page number",
    example: 1,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Page must be a number" })
  @Min(1, { message: "Page must be at least 1" })
  page?: number = 1;

  @ApiProperty({
    description: "Number of items per page",
    example: 10,
    required: false,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Limit must be a number" })
  @Min(1, { message: "Limit must be at least 1" })
  @Max(100, { message: "Limit must be at most 100" })
  limit?: number = 10;

  @ApiProperty({
    description: "Search term for name or description",
    example: "weight loss",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Search must be a string" })
  search?: string;

  @ApiProperty({
    description: "Filter by plan status",
    example: "ACTIVE",
    enum: ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"],
    required: false,
  })
  @IsOptional()
  @IsEnum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"], {
    message: "Status must be one of: DRAFT, ACTIVE, PAUSED, COMPLETED",
  })
  status?: string;

  @ApiProperty({
    description: "Filter by patient ID",
    example: "patient123",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Patient ID must be a string" })
  patientId?: string;
}
