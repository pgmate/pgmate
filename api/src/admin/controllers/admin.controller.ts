import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../admin.guard';

@UseGuards(AdminGuard)
@Controller('')
export class AdminController {
  @Get('status')
  getStatus() {
    return { status: 'ok' };
  }
}
