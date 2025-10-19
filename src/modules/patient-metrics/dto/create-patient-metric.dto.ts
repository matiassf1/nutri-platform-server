import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min, Max } from 'class-validator';

export enum MetricType {
  WEIGHT = 'WEIGHT',
  HEIGHT = 'HEIGHT',
  BMI = 'BMI',
  BODY_FAT = 'BODY_FAT',
  MUSCLE_MASS = 'MUSCLE_MASS',
  WATER_PERCENTAGE = 'WATER_PERCENTAGE',
  BONE_DENSITY = 'BONE_DENSITY',
  WAIST_CIRCUMFERENCE = 'WAIST_CIRCUMFERENCE',
  HIP_CIRCUMFERENCE = 'HIP_CIRCUMFERENCE',
  CHEST_CIRCUMFERENCE = 'CHEST_CIRCUMFERENCE',
  ARM_CIRCUMFERENCE = 'ARM_CIRCUMFERENCE',
  THIGH_CIRCUMFERENCE = 'THIGH_CIRCUMFERENCE',
  BLOOD_PRESSURE_SYSTOLIC = 'BLOOD_PRESSURE_SYSTOLIC',
  BLOOD_PRESSURE_DIASTOLIC = 'BLOOD_PRESSURE_DIASTOLIC',
  HEART_RATE = 'HEART_RATE',
  BLOOD_GLUCOSE = 'BLOOD_GLUCOSE',
  CHOLESTEROL = 'CHOLESTEROL',
  TRIGLYCERIDES = 'TRIGLYCERIDES',
}

export class CreatePatientMetricDto {
  @ApiProperty({
    description: 'Type of metric being recorded',
    enum: MetricType,
    example: MetricType.WEIGHT,
  })
  @IsEnum(MetricType)
  type: MetricType;

  @ApiProperty({
    description: 'Value of the metric',
    example: 70.5,
  })
  @IsNumber({}, { message: 'Value must be a number' })
  @Min(0, { message: 'Value must be positive' })
  value: number;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'kg',
  })
  @IsString()
  unit: string;

  @ApiProperty({
    description: 'Date when the metric was recorded',
    example: '2025-10-15T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  recordedAt?: Date;

  @ApiProperty({
    description: 'Additional notes about the metric',
    example: 'Measured after breakfast',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Patient ID (optional, defaults to current user)',
    example: 'cmgpsosz50003w28nh119n299',
    required: false,
  })
  @IsOptional()
  @IsString()
  patientId?: string;
}
