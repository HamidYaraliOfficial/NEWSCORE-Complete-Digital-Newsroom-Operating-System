import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const value = String(req.headers.authorization || '');
    if (!value.startsWith('Bearer ')) throw new UnauthorizedException('Authentication required');
    try {
      req.user = this.jwt.verify(value.slice(7), { secret: process.env.JWT_SECRET });
      return true;
    } catch { throw new UnauthorizedException('Invalid or expired access token'); }
  }
}
