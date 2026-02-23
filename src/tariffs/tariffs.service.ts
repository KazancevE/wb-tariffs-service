import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { DatabaseService } from '../db/database.service';
import { SheetsService } from '../sheets/sheets.service';
import type { WbTariffsResponse } from '../common/interfaces';

@Injectable()
export class TariffsService {
  private readonly apiUrl = 'https://common-api.wildberries.ru/api/v1/tariffs/box';
  private readonly logger = new Logger(TariffsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly sheetsService: SheetsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async fetchTariffs() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const resp = await axios.get(`${this.apiUrl}?date=${today}`, {
        headers: { Authorization: `Bearer ${process.env.WB_TOKEN || ''}` },
      });

      this.logger.log(`WB response status: ${resp.status}`);

      const body: any = resp.data;

      const warehouseList = body?.response?.data?.warehouseList;

      if (!Array.isArray(warehouseList)) {
        this.logger.error(
          'Invalid WB response structure: ' +
            JSON.stringify(body).slice(0, 500),
        );
        return;
      }

      const normalizeNumber = (value: unknown): number => {
        if (value === null || value === undefined) return 0;
        return Number(String(value).replace(',', '.'));
      };

      const data = warehouseList.map((warehouse: any) => ({
        fetch_date: today,
        warehouse_name: warehouse.warehouseName,
        geo_name: warehouse.geoName,
        box_delivery_base: normalizeNumber(warehouse.boxDeliveryBase),
        box_delivery_coef_expr: normalizeNumber(warehouse.boxDeliveryCoefExpr),
        box_storage_base: normalizeNumber(warehouse.boxStorageBase),
        box_storage_coef_expr: normalizeNumber(warehouse.boxStorageCoefExpr),
      }));

      await this.db
        .knex('wb_tariffs')
        .insert(data)
        .onConflict(['fetch_date', 'warehouse_name'])
        .merge([
          'box_delivery_base',
          'box_delivery_coef_expr',
          'box_storage_base',
          'box_storage_coef_expr',
        ]);

      this.logger.log(`Updated ${data.length} tariffs for ${today}`);
    } catch (error: any) {
      this.logger.error('Fetch tariffs error:', error.message);
    }
  }

  @Cron('0 */6 * * * *') // каждые 6 часов
  async updateSheets() {
    try {
      await this.sheetsService.updateSheets();
      this.logger.log('Google Sheets updated');
    } catch (error: any) {
      this.logger.error('Update sheets error:', error.message);
    }
  }
}
