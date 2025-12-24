import { Module } from '@nestjs/common';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { PrismaService } from '../../config/prisma.service';
import { ResponseService } from '../../common/services/response.service';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService, PrismaService, ResponseService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
