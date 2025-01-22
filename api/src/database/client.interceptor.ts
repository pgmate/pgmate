import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ClientService } from './client.service';

@Injectable()
export class ClientInterceptor implements NestInterceptor {
  constructor(private readonly clientService: ClientService) {}

  private getTarget(
    request: Request,
  ): [string | undefined, string | undefined] {
    const conn = request.headers['x-pgmate-conn'] || request.body?.conn;
    const db = conn
      ? request.headers['x-pgmate-db'] ||
        request.body?.db ||
        request.body?.database // deprecated
      : undefined;

    return [conn, db];
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const [conn, db] = this.getTarget(request);

    // Connect to the database
    try {
      // console.log('@onRequest', request.url, conn, db);
      await this.clientService.createClients(conn, db);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Close the connection at the end of the request
    return next.handle().pipe(
      tap(async () => {
        await this.clientService.dropClients();
      }),
      catchError(async (err) => {
        await this.clientService.dropClients();
        throw err;
      }),
    );
  }
}
