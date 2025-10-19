import { MessagingModule } from "@/messaging/messaging.module";
import { Module } from "@nestjs/common";
import { InvitationsModule } from "../invitations/invitations.module";
import { PatientsController } from "./patients.controller";
import { PatientsService } from "./patients.service";

@Module({
  imports: [MessagingModule, InvitationsModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
