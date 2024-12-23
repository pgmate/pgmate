import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto'; // Use the built-in Node.js crypto module

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminSecret = this.configService.get<string>('PGMATE_ADMIN_SECRET');
    const providedHashedSecret = request.headers['x-pgmate-admin-secret'];

    // Hash the admin secret using Node's crypto module
    const hashedAdminSecret = crypto
      .createHash('sha256')
      .update(adminSecret)
      .digest('hex');

    if (providedHashedSecret !== hashedAdminSecret) {
      throw new UnauthorizedException('Invalid admin secret');
    }

    return true;
  }
}
