import { ApiProperty } from "@nestjs/swagger";
import { MetricType } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateMetricDto {
  @ApiProperty({
    description: "Patient ID",
    example: "patient123",
  })
  @IsString({ message: "Patient ID must be a string" })
  @IsNotEmpty({ message: "Patient ID is required" })
  patientId: string;

  @ApiProperty({
    description: "Metric type",
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
  })
  @IsEnum(MetricType, {
    message:
      "Type must be one of: WEIGHT, BMI, BODY_FAT, MUSCLE_MASS, WAIST, HIP, CUSTOM",
  })
  type: MetricType;

  @ApiProperty({
    description: "Metric value",
    example: 75.5,
  })
  @IsNumber({}, { message: "Value must be a number" })
  @Min(0, { message: "Value must be non-negative" })
  value: number;

  @ApiProperty({
    description: "Unit of measurement",
    example: "kg",
  })
  @IsString({ message: "Unit must be a string" })
  @IsNotEmpty({ message: "Unit is required" })
  unit: string;

  @ApiProperty({
    description: "Date of measurement",
    example: "2024-01-15T10:30:00Z",
  })
  @IsDateString({}, { message: "Date must be a valid date" })
  date: string;

  @ApiProperty({
    description: "Additional notes",
    example: "Measured after workout",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Notes must be a string" })
  notes?: string;
}
