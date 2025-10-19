import { Module } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { MessagingModule } from "../../messaging/messaging.module";
import { InvitationsController } from "./invitations.controller";
import { InvitationsService } from "./invitations.service";

@Module({
  imports: [MessagingModule],
  controllers: [InvitationsController],
  providers: [InvitationsService, PrismaService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
