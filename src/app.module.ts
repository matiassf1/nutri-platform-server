import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

// Modules
import { HealthModule } from "./health/health.module";
import { AppointmentsModule } from "./modules/appointments/appointments.module";
import { AuthModule } from "./modules/auth/auth.module";
import { FilesModule } from "./modules/files/files.module";
import { InvitationsModule } from "./modules/invitations/invitations.module";
import { MessagesModule } from "./modules/messages/messages.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PatientMetricsModule } from "./modules/patient-metrics/patient-metrics.module";
import { PatientsModule } from "./modules/patients/patients.module";
import { PlansModule } from "./modules/plans/plans.module";
import { RecipesModule } from "./modules/recipes/recipes.module";
import { UsersModule } from "./modules/users/users.module";

// Common modules
import { CommonModule } from "./common/common.module";

// Configuration
import { AppConfigModule } from "./config/app-config.module";
import { DatabaseModule } from "./config/database.module";

@Module({
  imports: [
    // Configuration
    AppConfigModule,
    DatabaseModule,

    // Scheduling
    ScheduleModule.forRoot(),

    // Common modules
    CommonModule,

    // Feature modules
    AuthModule,
    UsersModule,
    AppointmentsModule,
    RecipesModule,
    PlansModule,
    PatientsModule,
    PatientMetricsModule,
    InvitationsModule,
    MetricsModule,
    FilesModule,
    MessagesModule,
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
