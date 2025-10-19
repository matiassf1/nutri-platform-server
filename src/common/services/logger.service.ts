import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    console.log(`[${new Date().toISOString()}] [LOG] ${context || this.context || 'Application'}: ${message}`);
  }

  error(message: any, trace?: string, context?: string) {
    console.error(`[${new Date().toISOString()}] [ERROR] ${context || this.context || 'Application'}: ${message}`);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: any, context?: string) {
    console.warn(`[${new Date().toISOString()}] [WARN] ${context || this.context || 'Application'}: ${message}`);
  }

  debug(message: any, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${new Date().toISOString()}] [DEBUG] ${context || this.context || 'Application'}: ${message}`);
    }
  }

  verbose(message: any, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${new Date().toISOString()}] [VERBOSE] ${context || this.context || 'Application'}: ${message}`);
    }
  }
}
