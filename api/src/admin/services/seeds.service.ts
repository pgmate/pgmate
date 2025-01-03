import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly pool: Pool) {}

  async listSeeds(): Promise<string[]> {
    const seedRootDir = path.join(__dirname, '../../seeds');
    this.logger.log(`Looking for seeds in: ${seedRootDir}`);

    const directories = fs
      .readdirSync(seedRootDir, { withFileTypes: true })
      .filter((dir) => dir.isDirectory())
      .map((dir) => dir.name)
      .sort();

    return directories;
  }

  async loadSeed(seedName: string): Promise<void> {
    const seedRootDir = path.join(__dirname, '../../seeds');
    const seedDir = path.join(seedRootDir, seedName);
    const seedFilePath = path.join(seedDir, 'seed.sql');

    if (!fs.existsSync(seedFilePath)) {
      this.logger.warn(`No seed.sql found in seed directory: ${seedName}`);
      return;
    }

    this.logger.log(`Loading seed: ${seedName}`);
    const sql = fs.readFileSync(seedFilePath, 'utf-8');

    try {
      await this.pool.query(sql);
      this.logger.log(`Seed ${seedName} applied successfully`);
    } catch (error) {
      this.logger.error(`Error applying seed ${seedName}`, error.message);
      throw error;
    }
  }
}