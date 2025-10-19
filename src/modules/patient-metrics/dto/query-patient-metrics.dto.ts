import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';
import { MetricType } from './create-patient-metric.dto';

export class QueryPatientMetricsDto {
  @ApiPropertyOptional({
    description: 'Filter by metric type',
    enum: MetricType,
  })
  @IsOptional()
  @IsEnum(MetricType)
  type?: MetricType;

  @ApiPropertyOptional({
    description: 'Filter by patient ID',
  })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering',
    example: '2025-10-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering',
    example: '2025-10-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  limit?: number = 20;
}
