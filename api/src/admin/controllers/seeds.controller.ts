import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { SeedService } from '../services/seeds.service';

@Controller('seeds')
export class SeedsController {
  private readonly logger = new Logger(SeedsController.name);

  constructor(private readonly seedService: SeedService) {}

  @Get()
  async listSeeds(): Promise<string[]> {
    this.logger.log('Listing all seeds');
    return this.seedService.listSeeds();
  }

  @Post(':seedName')
  async applySeed(@Param('seedName') seedName: string): Promise<{ success: boolean; error?: string }> {
    this.logger.log(`Applying seed: ${seedName}`);
    try {
      await this.seedService.loadSeed(seedName);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error applying seed: ${seedName}`, error.message);
      return { success: false, error: error.message };
    }
  }
}