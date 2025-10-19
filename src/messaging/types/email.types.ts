export enum EmailTemplateName {
  WELCOME = "welcome",
  PASSWORD_RESET = "password-reset",
  PLAN_UPDATE = "plan-update",
  PATIENT_INVITATION = "patient-invitation",
  APPOINTMENT_REMINDER = "appointment-reminder",
  RECIPE_RECOMMENDATION = "recipe-recommendation",
  NEWSLETTER = "newsletter",
  BASE_EMAIL = "base-email",
  ACCOUNT_VERIFICATION = "account-verification",
}

export type EmailPriority = "low" | "normal" | "high" | "urgent";

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  disposition?: "attachment" | "inline";
  cid?: string; // Content-ID for inline attachments
}

export interface EmailRecipient {
  email: string;
  name?: string;
  type?: "to" | "cc" | "bcc";
}

export interface EmailTracking {
  openTracking?: boolean;
  clickTracking?: boolean;
  unsubscribeTracking?: boolean;
}

export interface EmailDeliveryOptions {
  priority?: EmailPriority;
  tracking?: EmailTracking;
  scheduledAt?: Date;
  expiresAt?: Date;
}
