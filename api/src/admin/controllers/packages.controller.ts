import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { PackagesService } from '../services/packages.service';

@Controller('packages')
export class PackagesController {
  private readonly logger = new Logger(PackagesController.name);

  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  async listPackages(): Promise<string[]> {
    this.logger.log('Listing all packages');
    return this.packagesService.listPackages();
  }

  @Post(':packageName')
  async applySeed(@Param('packageName') packageName: string): Promise<{ success: boolean; error?: string }> {
    this.logger.log(`Applying package: ${packageName}`);
    try {
      await this.packagesService.loadPackage(packageName);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error applying package: ${packageName}`, error.message);
      return { success: false, error: error.message };
    }
  }
}