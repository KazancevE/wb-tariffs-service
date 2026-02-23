import { Controller, Get } from '@nestjs/common';
import { TariffsService } from './tariffs.service';

@Controller()
export class TariffsController {
  constructor(private readonly tariffsService: TariffsService) {}

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('run-once')
  async runOnce() {
    await this.tariffsService.fetchTariffs();
    await this.tariffsService.updateSheets();
    return { status: 'completed', timestamp: new Date().toISOString() };
  }
}
