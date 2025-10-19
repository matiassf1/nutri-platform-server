import { EmailTemplateName } from "../types/email.types";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  templateName: EmailTemplateName;
  templateData: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResponse {
  messageId: string;
  status: "sent" | "failed";
  error?: string;
}

export interface EmailTemplateConfig {
  name: string;
  subject: string;
  mjmlTemplate: string;
  compiledTemplate: string;
}
