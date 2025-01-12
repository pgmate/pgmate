import { Injectable, Logger } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PackagesService {
  private readonly logger = new Logger(PackagesService.name);

  constructor(private readonly connectionsService: ConnectionsService) {}

  private async _query(client, query, variables) {
    // console.log(client.connectionParameters, query.substr(0, 40), variables);
    const timerStart = performance.now();
    const result = await client.query(query, variables);
    const timerEnd = performance.now();
    return [result, `${(timerEnd - timerStart).toFixed(3)} ms`];
  }


  async listPackages(): Promise<string[]> {
    const packagesRootDir = path.join(__dirname, '../../../packages');
    this.logger.log(`Looking for Packages in: ${packagesRootDir}`);

    const directories = fs
      .readdirSync(packagesRootDir, { withFileTypes: true })
      .filter((dir) => dir.isDirectory())
      .map((dir) => dir.name)
      .sort();

    return directories;
  }

  async loadPackage(packageName: string, connection: string, database: string): Promise<void> {
    const packageRootDir = path.join(__dirname, '../../packages');
    const packageDir = path.join(packageRootDir, packageName);
    const packageFilePath = path.join(packageDir, 'main.sql');

    if (!fs.existsSync(packageFilePath)) {
      this.logger.warn(`No main.sql found in packages directory: ${packageName}`);
      return;
    }

    this.logger.log(`Loading package: ${packageName}`);
    const sql = fs.readFileSync(packageFilePath, 'utf-8');

    try {
      const [client, aquisitionTime] = await this.connectionsService.createClient(
        connection,
        database,
      );
      await this._query(client, sql, []);
      this.logger.log(`Package ${packageName} applied successfully`);
    } catch (error) {
      this.logger.error(`Error applying package ${packageName}`, error.message);
      throw error;
    }
  }
}