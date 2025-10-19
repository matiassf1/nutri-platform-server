import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class FindAllRecipesDto {
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
    description: "Search term for title or description",
    example: "chicken",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Search must be a string" })
  search?: string;

  @ApiProperty({
    description: "Filter by difficulty level",
    example: "MEDIUM",
    enum: ["EASY", "MEDIUM", "HARD"],
    required: false,
  })
  @IsOptional()
  @IsEnum(["EASY", "MEDIUM", "HARD"], {
    message: "Difficulty must be one of: EASY, MEDIUM, HARD",
  })
  difficulty?: string;

  @ApiProperty({
    description: "Filter by tags",
    example: ["healthy", "low-carb"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Tags must be an array" })
  @IsString({ each: true, message: "Each tag must be a string" })
  tags?: string[];

  @ApiProperty({
    description: "Filter by allergens",
    example: ["dairy", "nuts"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Allergens must be an array" })
  @IsString({ each: true, message: "Each allergen must be a string" })
  allergens?: string[];

  @ApiProperty({
    description: "Filter by active status",
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: "isActive must be a boolean" })
  isActive?: boolean = true;
}
