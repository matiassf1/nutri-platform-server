import { ApiProperty } from "@nestjs/swagger";
import { ActivityLevel, Gender } from "@prisma/client";
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from "class-validator";

export class UpdateUserProfileDto {
  @ApiProperty({
    description: "Dietary restrictions",
    example: ["vegetarian", "gluten-free"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Dietary restrictions must be an array" })
  @IsString({
    each: true,
    message: "Each dietary restriction must be a string",
  })
  dietaryRestrictions?: string[];

  @ApiProperty({
    description: "Food allergies",
    example: ["nuts", "dairy"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Allergies must be an array" })
  @IsString({ each: true, message: "Each allergy must be a string" })
  allergies?: string[];

  @ApiProperty({
    description: "Health goals",
    example: ["weight_loss", "muscle_gain", "maintenance"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Goals must be an array" })
  @IsString({ each: true, message: "Each goal must be a string" })
  goals?: string[];

  @ApiProperty({
    description: "Activity level",
    example: "MODERATE",
    enum: ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"],
    required: false,
  })
  @IsOptional()
  @IsEnum(ActivityLevel, {
    message:
      "Activity level must be one of: SEDENTARY, LIGHT, MODERATE, ACTIVE, VERY_ACTIVE",
  })
  activityLevel?: ActivityLevel;

  @ApiProperty({
    description: "Target weight in kg",
    example: 70.5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Target weight must be a number" })
  @IsPositive({ message: "Target weight must be positive" })
  @Min(30, { message: "Target weight must be at least 30 kg" })
  @Max(300, { message: "Target weight must be at most 300 kg" })
  targetWeight?: number;

  @ApiProperty({
    description: "Current weight in kg",
    example: 75.2,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Current weight must be a number" })
  @IsPositive({ message: "Current weight must be positive" })
  @Min(30, { message: "Current weight must be at least 30 kg" })
  @Max(300, { message: "Current weight must be at most 300 kg" })
  currentWeight?: number;

  @ApiProperty({
    description: "Height in cm",
    example: 175.5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Height must be a number" })
  @IsPositive({ message: "Height must be positive" })
  @Min(100, { message: "Height must be at least 100 cm" })
  @Max(250, { message: "Height must be at most 250 cm" })
  height?: number;

  @ApiProperty({
    description: "Age in years",
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Age must be a number" })
  @IsPositive({ message: "Age must be positive" })
  @Min(13, { message: "Age must be at least 13 years" })
  @Max(120, { message: "Age must be at most 120 years" })
  age?: number;

  @ApiProperty({
    description: "Gender",
    example: "MALE",
    enum: ["MALE", "FEMALE", "OTHER"],
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender, {
    message: "Gender must be one of: MALE, FEMALE, OTHER",
  })
  gender?: Gender;
}
