import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { EncryptionService } from '../shared/services/encryption.service';
import { QueryService } from './query.service';
import { RemoteDataService } from 'src/shared/services/remote-data.service';

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
    private readonly remoteData: RemoteDataService,
  ) {}

  async onApplicationBootstrap() {
    try {
      // await this.clientService.createClients();
      await this.prepMigrations();
      await this.runMigrations();
      await this.upsertConnection();
      await Promise.all([this.loadArticles(), this.loadFacts()]);
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
  INSERT INTO pgmate.connections VALUES ('default', 'PGMate default database', $1, 'false')
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
      ON CONFLICT (uuid) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        emoticon = EXCLUDED.emoticon,
        publish_date = EXCLUDED.publish_date,
        tags = EXCLUDED.tags,
        relevant_links = EXCLUDED.relevant_links,
        updated_at = NOW();
    `;

    try {
      const data = await this.remoteData.getJSON<{
        facts: {
          uuid: string;
          title: string;
          description?: string;
          emoticon: string;
          publish_date: string;
          tags: string[];
          relevant_links: string[];
        }[];
      }>(
        'https://raw.githubusercontent.com/pgmate/contents/refs/heads/main/contents/facts/facts.json',
        'facts.json',
      );

      return Promise.all(
        data.facts.map(($) =>
          this.queryService.query(INSERT_QUERY, [
            $.uuid,
            $.title,
            $.description,
            $.emoticon,
            $.publish_date,
            $.tags,
            $.relevant_links,
          ]),
        ),
      );
    } catch (error) {
      this.logger.error(`Failed loading FACTS: ${error.message}`);
    }
  }

  private async loadArticles() {
    const INSERT_TAG = `
      INSERT INTO pgmate.articles_tags (id, name, "desc", cover)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        "desc" = EXCLUDED."desc",
        cover = EXCLUDED.cover;
    `;

    const INSERT_SOURCE = `
      INSERT INTO pgmate.articles_sources (id, name, "desc", url, cover)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        "desc" = EXCLUDED."desc",
        url = EXCLUDED.url,
        cover = EXCLUDED.cover;
    `;

    const INSERT_ARTICLE = `
    INSERT INTO pgmate.articles (id, cdate, media, url, title, cover, excerpt, sources, tags)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE SET
      cdate = EXCLUDED.cdate,
      media = EXCLUDED.media,
      url = EXCLUDED.url,
      title = EXCLUDED.title,
      cover = EXCLUDED.cover,
      excerpt = EXCLUDED.excerpt,
      sources = EXCLUDED.sources,
      tags = EXCLUDED.tags;
    `;

    try {
      const data = await this.remoteData.getJSON<{
        tags: {
          id: string;
          title: string;
          desc?: string;
          cover?: string;
        }[];
        sources: {
          id: string;
          title: string;
          desc?: string;
          url?: string;
          cover?: string;
        }[];
        articles: {
          id: string;
          cdate: string;
          media: string;
          url: string;
          title: string;
          cover?: string;
          excerpt?: string;
          sources?: string[];
          tags?: string[];
        }[];
      }>(
        'https://raw.githubusercontent.com/pgmate/contents/refs/heads/main/contents/articles/articles.json',
        'articles.json',
        // true, // Remove in production
      );

      return Promise.all([
        ...data.tags.map(($) =>
          this.queryService.query(INSERT_TAG, [$.id, $.title, $.desc, $.cover]),
        ),
        ...data.sources.map(($) =>
          this.queryService.query(INSERT_SOURCE, [
            $.id,
            $.title,
            $.desc,
            $.url,
            $.cover,
          ]),
        ),
        ...data.articles.map(($) =>
          this.queryService.query(INSERT_ARTICLE, [
            $.id,
            $.cdate,
            $.media,
            $.url,
            $.title,
            $.cover,
            $.excerpt,
            $.sources,
            $.tags,
          ]),
        ),
      ]);
    } catch (error) {
      this.logger.error(`Failed loading ARTICLES: ${error.message}`);
    }
  }
}
