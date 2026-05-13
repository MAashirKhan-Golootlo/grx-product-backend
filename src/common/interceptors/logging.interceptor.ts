import {
  CallHandler,
  ExecutionContext,
  HttpException,
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
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      headers: Record<string, string>;
    }>();
    const { method, url } = request;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - startedAt;
          this.logger.log(
            `${method} ${url} → 200 +${ms}ms`,
            LoggingInterceptor.name,
          );
        },
        error: (error: unknown) => {
          const ms = Date.now() - startedAt;
          const status =
            error instanceof HttpException ? error.getStatus() : 500;
          const message =
            error instanceof HttpException
              ? JSON.stringify(error.getResponse())
              : error instanceof Error
                ? error.message
                : String(error);
          const stack = error instanceof Error ? error.stack : undefined;

          if (status >= 500) {
            this.logger.error(
              `${method} ${url} → ${status} +${ms}ms | ${message}`,
              stack,
              LoggingInterceptor.name,
            );
          } else {
            this.logger.warn(
              `${method} ${url} → ${status} +${ms}ms | ${message}`,
              LoggingInterceptor.name,
            );
          }
        },
      }),
    );
  }
}
