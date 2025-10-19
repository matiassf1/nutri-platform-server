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

export class FindAllPatientsDto {
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
    description: "Search term for patient name or email",
    example: "john",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Search must be a string" })
  search?: string;

  @ApiProperty({
    description: "Filter by patient status",
    example: "ACTIVE",
    enum: ["PENDING", "ACTIVE", "INACTIVE"],
    required: false,
  })
  @IsOptional()
  @IsEnum(["PENDING", "ACTIVE", "INACTIVE"], {
    message: "Status must be one of: PENDING, ACTIVE, INACTIVE",
  })
  status?: string;
}
