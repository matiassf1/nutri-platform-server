import { ApiProperty } from "@nestjs/swagger";
import { MealType, PlanStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

export class CreatePlanMealDto {
  @ApiProperty({
    description: "Meal type",
    example: "BREAKFAST",
    enum: ["BREAKFAST", "LUNCH", "DINNER", "SNACK"],
  })
  @IsEnum(MealType, {
    message: "Meal type must be one of: BREAKFAST, LUNCH, DINNER, SNACK",
  })
  type: MealType;

  @ApiProperty({
    description: "Meal time in HH:MM format",
    example: "08:00",
  })
  @IsString({ message: "Time must be a string" })
  @IsNotEmpty({ message: "Time is required" })
  time: string;

  @ApiProperty({
    description: "Whether the meal is completed",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: "isCompleted must be a boolean" })
  isCompleted?: boolean;

  @ApiProperty({
    description: "Additional notes for the meal",
    example: "High protein meal",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Notes must be a string" })
  notes?: string;

  @ApiProperty({
    description: "Recipe IDs for this meal",
    example: ["recipe1", "recipe2"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Recipe IDs must be an array" })
  @IsString({ each: true, message: "Each recipe ID must be a string" })
  recipeIds?: string[];
}

export class CreatePlanDayDto {
  @ApiProperty({
    description: "Day of week (0-6, Sunday-Saturday)",
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsNumber({}, { message: "Day of week must be a number" })
  @Min(0, { message: "Day of week must be at least 0" })
  @Max(6, { message: "Day of week must be at most 6" })
  dayOfWeek: number;

  @ApiProperty({
    description: "Whether this day is active",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: "isActive must be a boolean" })
  isActive?: boolean;

  @ApiProperty({
    description: "Additional notes for this day",
    example: "Rest day - light meals",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Notes must be a string" })
  notes?: string;

  @ApiProperty({
    description: "Meals for this day",
    type: [CreatePlanMealDto],
  })
  @IsArray({ message: "Meals must be an array" })
  @ArrayMinSize(1, { message: "At least one meal is required" })
  @ValidateNested({ each: true })
  @Type(() => CreatePlanMealDto)
  meals: CreatePlanMealDto[];
}

export class CreatePlanDto {
  @ApiProperty({
    description: "Plan name",
    example: "Weight Loss Plan - Week 1",
  })
  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({ message: "Name is required" })
  name: string;

  @ApiProperty({
    description: "Plan description",
    example:
      "A comprehensive weight loss plan focusing on balanced nutrition and portion control",
  })
  @IsString({ message: "Description must be a string" })
  @IsNotEmpty({ message: "Description is required" })
  description: string;

  @ApiProperty({
    description: "Patient ID for this plan",
    example: "patient123",
  })
  @IsString({ message: "Patient ID must be a string" })
  @IsNotEmpty({ message: "Patient ID is required" })
  patientId: string;

  @ApiProperty({
    description: "Plan status",
    example: "DRAFT",
    enum: ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"],
    required: false,
  })
  @IsOptional()
  @IsEnum(PlanStatus, {
    message: "Status must be one of: DRAFT, ACTIVE, PAUSED, COMPLETED",
  })
  status?: PlanStatus;

  @ApiProperty({
    description: "Plan start date",
    example: "2024-01-01T00:00:00Z",
  })
  @IsDateString({}, { message: "Start date must be a valid date" })
  startDate: string;

  @ApiProperty({
    description: "Plan end date",
    example: "2024-01-31T23:59:59Z",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "End date must be a valid date" })
  endDate?: string;

  @ApiProperty({
    description: "Plan goals",
    example: ["weight_loss", "muscle_gain", "improve_energy"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Goals must be an array" })
  @IsString({ each: true, message: "Each goal must be a string" })
  goals?: string[];

  @ApiProperty({
    description: "Additional notes for the plan",
    example: "Monitor progress weekly and adjust as needed",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Notes must be a string" })
  notes?: string;

  @ApiProperty({
    description: "Plan days",
    type: [CreatePlanDayDto],
  })
  @IsArray({ message: "Days must be an array" })
  @ArrayMinSize(1, { message: "At least one day is required" })
  @ValidateNested({ each: true })
  @Type(() => CreatePlanDayDto)
  days: CreatePlanDayDto[];
}
