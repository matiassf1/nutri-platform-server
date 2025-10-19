import { Module } from '@nestjs/common';
import { PatientMetricsController } from './patient-metrics.controller';
import { PatientMetricsService } from './patient-metrics.service';
import { PrismaService } from '../../config/prisma.service';
import { ResponseService } from '../../common/services/response.service';

@Module({
  controllers: [PatientMetricsController],
  providers: [PatientMetricsService, PrismaService, ResponseService],
  exports: [PatientMetricsService],
})
export class PatientMetricsModule {}
