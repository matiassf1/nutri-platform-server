import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from "class-validator";

export class UpdateUserDto {
  @ApiProperty({
    description: "User full name",
    example: "John Doe",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Name must be a string" })
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  name?: string;

  @ApiProperty({
    description: "User avatar URL",
    example: "https://example.com/avatar.jpg",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Avatar must be a string" })
  @IsUrl({}, { message: "Avatar must be a valid URL" })
  avatar?: string;

  @ApiProperty({
    description: "Phone number",
    example: "+54 9 11 1234-5678",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Phone must be a string" })
  phone?: string;

  @ApiProperty({
    description: "Address",
    example: "Calle 123, Ciudad, País",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Address must be a string" })
  address?: string;

  @ApiProperty({
    description: "Professional biography",
    example: "Nutricionista especializada en...",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Bio must be a string" })
  bio?: string;

  @ApiProperty({
    description: "Professional specialization",
    example: "Nutrición Clínica",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Specialization must be a string" })
  specialization?: string;

  @ApiProperty({
    description: "Years of experience",
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Experience must be a number" })
  @Min(0, { message: "Experience must be at least 0" })
  @Max(50, { message: "Experience must be at most 50" })
  experience?: number;

  @ApiProperty({
    description: "Educational background",
    example: "Licenciatura en Nutrición - Universidad de Buenos Aires",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Education must be a string" })
  education?: string;

  @ApiProperty({
    description: "Professional certifications",
    example: "Certificación en Nutrición Deportiva - ACN",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Certifications must be a string" })
  certifications?: string;

  @ApiProperty({
    description: "Personal website",
    example: "https://www.nutricionista.com",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Website must be a string" })
  @IsUrl({}, { message: "Website must be a valid URL" })
  website?: string;

  @ApiProperty({
    description: "LinkedIn profile URL",
    example: "https://linkedin.com/in/nutricionista",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "LinkedIn must be a string" })
  @IsUrl({}, { message: "LinkedIn must be a valid URL" })
  linkedin?: string;

  @ApiProperty({
    description: "Instagram profile URL",
    example: "https://instagram.com/nutricionista",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Instagram must be a string" })
  @IsUrl({}, { message: "Instagram must be a valid URL" })
  instagram?: string;

  @ApiProperty({
    description: "Consultation fee",
    example: 150.5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Consultation fee must be a number" })
  @Min(0, { message: "Consultation fee must be at least 0" })
  consultationFee?: number;

  @ApiProperty({
    description: "Timezone",
    example: "America/Argentina/Buenos_Aires",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Timezone must be a string" })
  timezone?: string;

  @ApiProperty({
    description: "Languages spoken",
    example: ["Spanish", "English"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Language must be an array" })
  @IsString({ each: true, message: "Each language must be a string" })
  language?: string[];

  @ApiProperty({
    description: "Availability schedule",
    example: { monday: { start: "09:00", end: "17:00" } },
    required: false,
  })
  @IsOptional()
  availability?: any;
}
