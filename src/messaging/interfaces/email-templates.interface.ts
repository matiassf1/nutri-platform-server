export interface BaseEmailTemplate {
  userName: string;
  userEmail: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  additionalInfo?: string;
  warning?: string;
  currentYear: number;
  securityUrl: string;
  privacyUrl: string;
  termsUrl: string;
}

export interface WelcomeEmailTemplate extends BaseEmailTemplate {
  planName?: string;
  nutritionistName?: string;
}

export interface PasswordResetEmailTemplate extends BaseEmailTemplate {
  resetUrl: string;
  timeLimit: string;
}

export interface PlanUpdateEmailTemplate extends BaseEmailTemplate {
  planName: string;
  nutritionistName: string;
  changes: string[];
}

export interface PatientInvitationEmailTemplate extends BaseEmailTemplate {
  nutritionistName: string;
  invitationUrl: string;
  personalMessage?: string;
}

export interface AppointmentReminderEmailTemplate extends BaseEmailTemplate {
  appointmentDate: string;
  appointmentTime: string;
  nutritionistName: string;
  appointmentType: string;
}

export interface RecipeRecommendationEmailTemplate extends BaseEmailTemplate {
  recipeName: string;
  recipeDescription: string;
  cookTime: string;
  calories: number;
  recipeUrl: string;
  nutritionistName: string;
}

export type EmailTemplateData =
  | WelcomeEmailTemplate
  | PasswordResetEmailTemplate
  | PlanUpdateEmailTemplate
  | PatientInvitationEmailTemplate
  | AppointmentReminderEmailTemplate
  | RecipeRecommendationEmailTemplate;
