import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import * as Joi from "joi";
import * as path from "path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      // Look for env files in both runtime CWD (server/) and repo root
      envFilePath: [
        path.join(process.cwd(), ".env.local"),
        path.join(process.cwd(), ".env"),
        path.resolve(__dirname, "../../.env.local"),
        path.resolve(__dirname, "../../.env"),
      ],
      validationSchema: Joi.object({
        // Core
        NODE_ENV: Joi.string()
          .valid("development", "production", "test")
          .default("development"),
        PORT: Joi.number().default(3000),
        FRONTEND_URL: Joi.string().uri().default("http://localhost:8080"),

        // Database
        DATABASE_URL: Joi.string().required(),

        // Auth
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default("24h"),
        JWT_REFRESH_SECRET: Joi.string().optional(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().optional(),

        // Throttling
        THROTTLE_TTL: Joi.number().default(60000),
        THROTTLE_LIMIT: Joi.number().default(100),

        // Email
        NODEMAILER_HOST: Joi.string().required(),
        NODEMAILER_PORT: Joi.number().required(),
        NODEMAILER_ENCRYPTION: Joi.string().valid("tls", "ssl").default("tls"),
        NODEMAILER_AUTH_USER: Joi.string().required(),
        NODEMAILER_AUTH_PASS: Joi.string().required(),
        NODEMAILER_SENDER_NAME: Joi.string().default("Nutrition Platform"),
        NODEMAILER_SENDER_MAIL: Joi.string()
          .email()
          .default("noreply@nutrition-platform.com"),

        // Storage / AWS (optional for local dev)
        STORAGE_PROVIDER: Joi.string().default("s3"),
        STORAGE_BUCKET: Joi.string().optional(),
        AWS_ACCESS_KEY_ID: Joi.string().optional(),
        AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
        AWS_REGION: Joi.string().optional(),
        AWS_ENDPOINT: Joi.string().optional(),
        AWS_FORCE_PATH_STYLE: Joi.boolean().optional(),

        // Uploads
        MAX_FILE_SIZE: Joi.number().default(10485760),
        ALLOWED_FILE_TYPES: Joi.string().optional(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>("THROTTLE_TTL", 60000),
          limit: config.get<number>("THROTTLE_LIMIT", 100),
        },
      ],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
