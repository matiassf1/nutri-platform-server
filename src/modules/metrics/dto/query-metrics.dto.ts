import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class FindAllMetricsDto {
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
    description: "Filter by patient ID",
    example: "patient123",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Patient ID must be a string" })
  patientId?: string;

  @ApiProperty({
    description: "Filter by metric type",
    example: "WEIGHT",
    enum: [
      "WEIGHT",
      "BMI",
      "BODY_FAT",
      "MUSCLE_MASS",
      "WAIST",
      "HIP",
      "CUSTOM",
    ],
    required: false,
  })
  @IsOptional()
  @IsEnum(
    ["WEIGHT", "BMI", "BODY_FAT", "MUSCLE_MASS", "WAIST", "HIP", "CUSTOM"],
    {
      message:
        "Type must be one of: WEIGHT, BMI, BODY_FAT, MUSCLE_MASS, WAIST, HIP, CUSTOM",
    }
  )
  type?: string;

  @ApiProperty({
    description: "Start date filter",
    example: "2024-01-01T00:00:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "Start date must be a valid date" })
  startDate?: string;

  @ApiProperty({
    description: "End date filter",
    example: "2024-01-31T23:59:59Z",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "End date must be a valid date" })
  endDate?: string;
}
