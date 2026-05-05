import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { format, transports } from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger = WinstonModule.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.ms(),
      nestWinstonModuleUtilities.format.nestLike('GRXBackend', {
        prettyPrint: true,
      }),
    ),
    transports: [new transports.Console()],
  });

  public log(message: string, context?: string): void {
    this.logger.log(message, context);
  }

  public error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, trace, context);
  }

  public warn(message: string, context?: string): void {
    this.logger.warn(message, context);
  }

  public debug(message: string, context?: string): void {
    this.logger.debug?.(message, context);
  }

  public verbose(message: string, context?: string): void {
    this.logger.verbose?.(message, context);
  }
}
