import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge?: number;
};

@Injectable()
export class CookieService {
  private readonly cookieOptions: CookieOptions;

  constructor(private configService: ConfigService) {
    this.cookieOptions =
      this.configService.get<string>('NODE_ENV') === 'development'
        ? {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            maxAge: 180 * 24 * 60 * 60 * 1000,
          }
        : {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 180 * 24 * 60 * 60 * 1000,
          };
  }

  setItem(
    name: string,
    value: string,
    {
      res,
      cookieOptions,
    }: {
      res: Response;
      cookieOptions?: CookieOptions;
    },
  ): void {
    res.cookie(name, value, {
      ...this.cookieOptions,
      ...cookieOptions,
    });
  }

  getItem(name: string, { req }: { req: Request }): string | undefined {
    return req.cookies[name];
  }

  deleteItem(
    name: string,
    {
      res,
      cookieOptions,
    }: {
      res: Response;
      cookieOptions?: CookieOptions;
    },
  ): void {
    res.clearCookie(name, { ...this.cookieOptions, ...cookieOptions });
  }
}
