import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TariffsService } from './tariffs.service';
import { TariffsController } from './tariffs.controller';
import { SheetsService } from '../sheets/sheets.service';
import { DatabaseService } from '../db/database.service';

@Module({
  imports: [ScheduleModule.forRoot()],  // ← Добавьте forRoot()
  controllers: [TariffsController],
  providers: [TariffsService, SheetsService, DatabaseService],
})
export class TariffsModule {}
