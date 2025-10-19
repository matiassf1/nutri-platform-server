import { Global, Module, ValidationPipe } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";

// Guards
import { ThrottlerGuard } from "@nestjs/throttler";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";

// Interceptors
import { LoggingInterceptor } from "./interceptors/logging.interceptor";
import { ResponseInterceptor } from "./interceptors/response.interceptor";

// Filters
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";
import { HttpExceptionFilter } from "./filters/http-exception.filter";

// Services
import { MessagingModule } from "../messaging/messaging.module";
import { LoggerService } from "./services/logger.service";
import { ResponseService } from "./services/response.service";

// Controllers
import { FilesController } from "./controllers/files.controller";

@Global()
@Module({
  imports: [MessagingModule],
  controllers: [FilesController],
  providers: [
    // Services
    ResponseService,
    LoggerService,

    // Guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

    // Filters
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    // Pipes
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  exports: [ResponseService, LoggerService, MessagingModule],
})
export class CommonModule {}
