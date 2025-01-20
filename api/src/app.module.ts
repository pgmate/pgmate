import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as Joi from 'joi';
import { join } from 'path';
import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './database/database.module';
import { HealthzModule } from './healthz/healthz.module';
import { AdminModule } from './admin/admin.module';

const config = ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production').required(),
    PORT: Joi.number().port().default(8080),
    PGSTRING: Joi.string().uri().required(),
    PGMATE_ADMIN_SECRET: Joi.string().required(),
    PGMATE_ENCRYPTION_KEY: Joi.string().optional().default(''),
    PGMATE_OPENAPI_KEY: Joi.string().optional().default(''),
  }),
});

@Module({
  imports: [
    config,
    SharedModule,
    DatabaseModule,
    HealthzModule,
    AdminModule,
    RouterModule.register([
      {
        path: 'admin/v1',
        module: AdminModule,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(
        __dirname,
        process.env.NODE_ENV === 'production' ? 'public' : '../public',
      ),
      exclude: ['/admin*'], // Exclude API routes from being handled by static files
    }),
  ],
})
export class AppModule {}
