import { ApiProperty } from "@nestjs/swagger";
import { Difficulty } from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

export class CreateRecipeIngredientDto {
  @ApiProperty({
    description: "Ingredient name",
    example: "Chicken breast",
  })
  @IsString({ message: "Ingredient name must be a string" })
  @IsNotEmpty({ message: "Ingredient name is required" })
  name: string;

  @ApiProperty({
    description: "Amount of ingredient",
    example: 500,
  })
  @IsNumber({}, { message: "Amount must be a number" })
  @Min(0.1, { message: "Amount must be at least 0.1" })
  amount: number;

  @ApiProperty({
    description: "Unit of measurement",
    example: "grams",
  })
  @IsString({ message: "Unit must be a string" })
  @IsNotEmpty({ message: "Unit is required" })
  unit: string;

  @ApiProperty({
    description: "Additional notes for the ingredient",
    example: "Boneless, skinless",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Notes must be a string" })
  notes?: string;
}

export class CreateRecipeNutritionDto {
  @ApiProperty({
    description: "Calories per serving",
    example: 350,
  })
  @IsNumber({}, { message: "Calories must be a number" })
  @Min(0, { message: "Calories must be non-negative" })
  calories: number;

  @ApiProperty({
    description: "Protein in grams",
    example: 25.5,
  })
  @IsNumber({}, { message: "Protein must be a number" })
  @Min(0, { message: "Protein must be non-negative" })
  protein: number;

  @ApiProperty({
    description: "Carbohydrates in grams",
    example: 30.2,
  })
  @IsNumber({}, { message: "Carbs must be a number" })
  @Min(0, { message: "Carbs must be non-negative" })
  carbs: number;

  @ApiProperty({
    description: "Fat in grams",
    example: 12.8,
  })
  @IsNumber({}, { message: "Fat must be a number" })
  @Min(0, { message: "Fat must be non-negative" })
  fat: number;

  @ApiProperty({
    description: "Fiber in grams",
    example: 5.2,
  })
  @IsNumber({}, { message: "Fiber must be a number" })
  @Min(0, { message: "Fiber must be non-negative" })
  fiber: number;

  @ApiProperty({
    description: "Sugar in grams",
    example: 8.5,
  })
  @IsNumber({}, { message: "Sugar must be a number" })
  @Min(0, { message: "Sugar must be non-negative" })
  sugar: number;

  @ApiProperty({
    description: "Sodium in milligrams",
    example: 450,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Sodium must be a number" })
  @Min(0, { message: "Sodium must be non-negative" })
  sodium?: number;

  @ApiProperty({
    description: "Cholesterol in milligrams",
    example: 75,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Cholesterol must be a number" })
  @Min(0, { message: "Cholesterol must be non-negative" })
  cholesterol?: number;
}

export class CreateRecipeDto {
  @ApiProperty({
    description: "Recipe title",
    example: "Grilled Chicken with Vegetables",
  })
  @IsString({ message: "Title must be a string" })
  @IsNotEmpty({ message: "Title is required" })
  title: string;

  @ApiProperty({
    description: "Recipe name (optional, defaults to title)",
    example: "Grilled Chicken with Vegetables",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Name must be a string" })
  name?: string;

  @ApiProperty({
    description: "Recipe description",
    example:
      "A healthy and delicious grilled chicken recipe with seasonal vegetables",
  })
  @IsString({ message: "Description must be a string" })
  @IsNotEmpty({ message: "Description is required" })
  description: string;

  @ApiProperty({
    description: "Recipe image URL",
    example: "https://example.com/recipe-image.jpg",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Image must be a string" })
  @IsUrl({}, { message: "Image must be a valid URL" })
  image?: string;

  @ApiProperty({
    description: "Cooking time in minutes",
    example: 30,
  })
  @IsNumber({}, { message: "Cook time must be a number" })
  @Min(1, { message: "Cook time must be at least 1 minute" })
  @Max(1440, { message: "Cook time must be at most 24 hours" })
  cookTime: number;

  @ApiProperty({
    description: "Preparation time in minutes",
    example: 15,
  })
  @IsNumber({}, { message: "Prep time must be a number" })
  @Min(0, { message: "Prep time must be non-negative" })
  @Max(1440, { message: "Prep time must be at most 24 hours" })
  prepTime: number;

  @ApiProperty({
    description: "Number of servings",
    example: 4,
  })
  @IsNumber({}, { message: "Servings must be a number" })
  @Min(1, { message: "Servings must be at least 1" })
  @Max(50, { message: "Servings must be at most 50" })
  servings: number;

  @ApiProperty({
    description: "Recipe difficulty level",
    example: "MEDIUM",
    enum: ["EASY", "MEDIUM", "HARD"],
  })
  @IsEnum(Difficulty, {
    message: "Difficulty must be one of: EASY, MEDIUM, HARD",
  })
  difficulty: Difficulty;

  @ApiProperty({
    description: "Recipe tags",
    example: ["healthy", "low-carb", "protein-rich"],
    type: [String],
  })
  @IsArray({ message: "Tags must be an array" })
  @IsString({ each: true, message: "Each tag must be a string" })
  @ArrayMinSize(1, { message: "At least one tag is required" })
  tags: string[];

  @ApiProperty({
    description: "Allergens present in the recipe",
    example: ["dairy", "nuts"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Allergens must be an array" })
  @IsString({ each: true, message: "Each allergen must be a string" })
  allergens?: string[];

  @ApiProperty({
    description: "Whether the recipe is active",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: "isActive must be a boolean" })
  isActive?: boolean;

  @ApiProperty({
    description: "Recipe ingredients",
    type: [CreateRecipeIngredientDto],
  })
  @IsArray({ message: "Ingredients must be an array" })
  @ArrayMinSize(1, { message: "At least one ingredient is required" })
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto)
  ingredients: CreateRecipeIngredientDto[];

  @ApiProperty({
    description: "Recipe nutrition information",
    type: CreateRecipeNutritionDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRecipeNutritionDto)
  nutrition?: CreateRecipeNutritionDto;
}
