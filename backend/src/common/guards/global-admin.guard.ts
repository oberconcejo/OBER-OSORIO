import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class GlobalAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'GLOBAL_ADMIN') {
      throw new ForbiddenException({
        success: false,
        error: { code: 'FORBIDDEN', message: 'No tienes autorización para acceder a este recurso.' }
      });
    }

    return true;
  }
}
