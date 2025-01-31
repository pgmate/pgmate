import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ClientService } from './client.service';

@Injectable()
export class ClientInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ClientInterceptor.name);
  constructor(private readonly clientService: ClientService) {}

  private getTarget(
    request: Request,
  ): [string | undefined, string | undefined] {
    // const conn = request.headers['x-pgmate-conn'] || request.body?.conn;
    // const db = conn
    //   ? request.headers['x-pgmate-db'] ||
    //     request.body?.db ||
    //     request.body?.database // deprecated
    //   : undefined;

    const conn = (request.headers['x-pgmate-conn'] as string) || undefined;
    const db = conn
      ? (request.headers['x-pgmate-db'] as string) || undefined
      : undefined;

    // if (request.body?.conn) {
    //   this.logger.warn(`${request.url} - @deprecated "conn" property`);
    // }
    // if (request.body?.db) {
    //   this.logger.warn(`${request.url} - @deprecated "db" property`);
    // }
    // if (request.body?.database) {
    //   this.logger.warn(`${request.url} - @deprecated "database" property`);
    // }

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
