import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminSecret = this.configService.get<string>('PGMATE_ADMIN_SECRET');
    const providedSecret = request.headers['x-pgmate-admin-secret'];

    if (providedSecret !== adminSecret) {
      throw new UnauthorizedException('Invalid admin secret');
    }

    return true;
  }
}
