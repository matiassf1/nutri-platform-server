import { PartialType } from '@nestjs/swagger';
import { CreatePatientMetricDto } from './create-patient-metric.dto';

export class UpdatePatientMetricDto extends PartialType(CreatePatientMetricDto) {}
