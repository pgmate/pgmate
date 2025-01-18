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
    const packageRootDir = path.join(__dirname, '../../../packages');
    const packageDir = path.join(packageRootDir, packageName);
    const packageFilePath = path.join(packageDir, 'main.sql');

    if (!fs.existsSync(packageFilePath)) {
      this.logger.error(`No main.sql found in packages directory: ${packageDir}`);
      throw new Error(`No main.sql found in package: ${packageName}`);
    }

    this.logger.log(`Loading package: ${packageName} for connection: ${connection} database: ${database}`);
    
    try {    
      const sql = await this.preprocessSql(packageDir, 'main.sql');

      const [client, aquisitionTime] = await this.connectionsService.createClient(
        connection,
        database,
      );
      await this._query(client, sql, []);
      this.logger.log(`Package ${packageName} applied successfully on connection ${connection} database ${database}`);
    } catch (error) {
      this.logger.error(`Error applying package ${packageName} on connection ${connection} database ${database}`, error.message);
      throw error;
    }
  }

  async preprocessSql(dirPath: string, fileName: string): Promise<any> {
    const absolutePath = path.join(dirPath, fileName);
    const filedata = await fs.readFileSync(absolutePath, "utf-8");
    //const sql = fs.readFileSync(packageFilePath, 'utf-8');
    const sql = filedata as unknown as string;
    // Match all \i commands
    const matches = sql .match(/\\i\s+['"]?([^'"\s]+)['"]?/g) ;
    if (!matches) {
      return sql; // Return the SQL if there are no \i commands
    }
  
    let processedSql:string = sql;
  
    for (const match of matches) {
      const includePathMatch = match.match(/\\i\s+['"]?([^'"\s]+)['"]?/);
      if (includePathMatch && includePathMatch[1]) {
        const includePath = includePathMatch[1];
        const includedSql = await this.preprocessSql(dirPath, includePath); // Recursive inclusion
        processedSql = processedSql.replace(match, includedSql);
      }
    }
  
    return processedSql;
  }

}