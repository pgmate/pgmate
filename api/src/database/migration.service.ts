import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { EncryptionService } from '../shared/services/encryption.service';
import { QueryService } from './query.service';

interface Fact {
  uuid: string;
  title: string;
  description: string;
  emoticon: string;
  publish_date: string;
  tags: string[];
  relevant_links: string[];
}

@Injectable()
export class MigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigrationService.name);
  private appliedMigrations: string[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly queryService: QueryService,
  ) {}

  async onApplicationBootstrap() {
    try {
      // await this.clientService.createClients();
      await this.prepMigrations();
      await this.runMigrations();
      await this.upsertConnection();
      await this.loadFacts();
    } catch (error) {
      this.logger.error('Error running migrations:', error.message);
      throw error;
    }
  }

  private async prepMigrations() {
    try {
      const result = await this.queryService.query(
        'SELECT id FROM pgmate.migrations',
      );
      this.appliedMigrations = result.rows.map((row) => row.id.toString());
    } catch (error) {
      if (error.code !== '42P01') {
        this.logger.error('Error checking migrations table:', error.message);
        throw error;
      }
    }
  }

  private async runMigrations() {
    const migrationRootDir = path.join(__dirname, '../../migrations/default');
    this.logger.log(`Looking for migrations in: ${migrationRootDir}`);

    // Read all migration folders
    // Sort by migration ID (numeric part before "_")
    const directories = fs
      .readdirSync(migrationRootDir, { withFileTypes: true })
      .filter((dir) => dir.isDirectory())
      .map((dir) => dir.name)
      .sort((a, b) => {
        const aId = parseInt(a.split('_')[0], 10);
        const bId = parseInt(b.split('_')[0], 10);
        return aId - bId;
      });

    for (const directory of directories) {
      const upFilePath = path.join(migrationRootDir, directory, 'up.sql');
      const [migrationId, ...migrationName] = directory.split('_');

      if (fs.existsSync(upFilePath)) {
        // Skip if migration has already been applied
        if (this.appliedMigrations.includes(migrationId)) {
          this.logger.log(`Skipping migration: ${directory}`);
          continue;
        }

        this.logger.log(`Running migration: ${directory}`);
        const sql = fs.readFileSync(upFilePath, 'utf-8');
        try {
          await this.queryService.query(sql);
          await this.queryService.query(
            `INSERT INTO pgmate.migrations (target, id, name) VALUES ('default', $1, $2)`,
            [migrationId, migrationName.join('_')],
          );
          this.logger.log(`Migration ${directory} applied successfully`);
        } catch (error) {
          this.logger.error(
            `Error running migration ${directory}`,
            error.message,
          );
          throw error;
        }
      } else {
        this.logger.warn(
          `No up.sql found in migration directory: ${directory}`,
        );
      }
    }
  }

  private async upsertConnection() {
    // Upsert the default connection
    this.queryService.query(
      `
  INSERT INTO pgmate.connections VALUES ('default', 'PGMate default database', $1, false)
  ON CONFLICT ON CONSTRAINT "connections_pkey" DO UPDATE SET
      "desc" = EXCLUDED."desc", 
      "conn" = EXCLUDED."conn", 
      "ssl" = EXCLUDED."ssl", 
      "updated_at" = NOW()`,
      [this.encryptionService.encrypt(this.configService.get('PGSTRING'))],
    );
  }

  private async loadFacts() {
    const INSERT_QUERY = `
      INSERT INTO pgmate.facts
      ( uuid, title, description, emoticon, publish_date, tags, relevant_links )
      VALUES
      ( $1, $2, $3, $4, $5, $6, $7 )
      ON CONFLICT ON CONSTRAINT "facts_pkey" DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        emoticon = EXCLUDED.emoticon,
        publish_date = EXCLUDED.publish_date,
        tags = EXCLUDED.tags,
        relevant_links = EXCLUDED.relevant_links,
        updated_at = NOW()
    `;

    const upsertFromJson = async (data: Fact[]) => {
      try {
        for (const fact of data) {
          await this.queryService.query(INSERT_QUERY, [
            fact.uuid,
            fact.title,
            fact.description,
            fact.emoticon,
            fact.publish_date,
            fact.tags,
            fact.relevant_links,
          ]);
        }
      } catch (err) {
        this.logger.error('Error upserting facts:', err.message);
      }
    };

    // Load facts from remote JSON file
    try {
      const remoteUrl =
        'https://raw.githubusercontent.com/pgmate/contents/refs/heads/main/contents/facts.json';
      this.logger.log(`Fetching remote facts from ${remoteUrl}`);

      const response = await fetch(remoteUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch remote facts: ${response.status} ${response.statusText}`,
        );
      }

      const remoteFacts = await response.json();
      await upsertFromJson(remoteFacts);
      this.logger.log('Remote facts loaded successfully');
    } catch (error) {
      // Fallback to local JSON file
      this.logger.error(
        'Error loading facts from remote URL. Falling back to local copy.',
        error.message,
      );

      const filePath = path.join(__dirname, '../../contents/facts.json');
      const localContent = await fs.promises.readFile(filePath, 'utf-8');
      await upsertFromJson(JSON.parse(localContent));
    }
  }
}
