import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secret: string;
  private readonly duration: string;

  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('JWT_SECRET');
    this.duration = this.configService.get<string>('JWT_DURATION');
  }

  sign(payload: object, options: object = {}): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.duration,
      ...options,
    });
  }
}
