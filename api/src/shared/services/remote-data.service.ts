import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RemoteDataService {
  private readonly logger = new Logger(RemoteDataService.name);

  async getJSON<T = any>(
    url: string,
    localFallback?: string,
    localFirst?: boolean,
  ): Promise<T> {
    try {
      if (localFirst) {
        throw new Error(`Requested local version first: ${localFallback}`);
      }
      this.logger.verbose(`getJSON: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch remote: ${url} -> ${response.status} ${response.statusText}`,
        );
      }

      return response.json();
    } catch (error) {
      // Fallback to local JSON file
      this.logger.error(error.message);

      if (localFallback) {
        try {
          const filePath = path.join(
            __dirname,
            `../../../contents/${localFallback}`,
          );
          const localContent = await fs.promises.readFile(filePath, 'utf-8');
          return JSON.parse(localContent);
        } catch (error1) {
          this.logger.error(
            `Failed to source from local fallback: ${localFallback} -> ${error1.message}`,
          );
        }
      } else {
        throw error;
      }
    }
  }
}
