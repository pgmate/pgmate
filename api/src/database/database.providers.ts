// src/database/database.providers.ts
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

const logger = new Logger('DatabaseProvider');

export const databaseProviders = [
  {
    provide: 'PG_CONNECTION',
    useFactory: async (configService: ConfigService) => {
      const pool = new Pool({
        connectionString: configService.get<string>('PGSTRING'),
      });

      try {
        await pool.query('SELECT NOW()');
        logger.log('Database connection established');
      } catch (error) {
        logger.error('Database connection failed:', error);
        throw error;
      }

      return pool;
    },
    inject: [ConfigService],
  },
];
