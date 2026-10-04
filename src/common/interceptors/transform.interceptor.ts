import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponseBody<T> {
  success: true;
  data: T;
  message: string;
}

/**
 * Global response interceptor.
 * Wraps every successful controller response in a consistent envelope so
 * clients can rely on the same top-level shape across all endpoints.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, SuccessResponseBody<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<SuccessResponseBody<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        data,
        message: 'Success',
      })),
    );
  }
}
