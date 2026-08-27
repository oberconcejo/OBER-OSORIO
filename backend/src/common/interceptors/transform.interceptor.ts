import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const bypassRoutes = ['/saas', '/admin', '/strategic', '/territorial', '/instantdb-config', '/supabase-config'];
    
    if (bypassRoutes.some(route => request.url.includes(route))) {
      return next.handle();
    }

    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
      })),
    );
  }
}
