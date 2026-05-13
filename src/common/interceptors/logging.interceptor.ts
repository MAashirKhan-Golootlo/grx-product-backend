import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  public constructor(private readonly logger: LoggerService) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<{ method: string; url: string }>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            `${request.method} ${request.url} ${String(Date.now() - startedAt)}ms`,
            LoggingInterceptor.name,
          );
        },
        error: (error: Error) => {
          this.logger.error(
            `${request.method} ${request.url} ${String(Date.now() - startedAt)}ms`,
            error.stack,
            LoggingInterceptor.name,
          );
        },
      }),
    );
  }
}
