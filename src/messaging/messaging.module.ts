import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NodemailerProvider } from "./providers/nodemailer.provider";
import { EmailTemplateService } from "./services/email-template.service";
import { EmailService } from "./services/email.service";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [EmailService, NodemailerProvider, EmailTemplateService],
  exports: [EmailService, NodemailerProvider, EmailTemplateService],
})
export class MessagingModule {}
