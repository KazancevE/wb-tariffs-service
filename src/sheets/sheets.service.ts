import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { google } = require('googleapis');

@Injectable()
export class SheetsService {
  private readonly logger = new Logger(SheetsService.name);

  constructor(private readonly db: DatabaseService) {}

  async updateSheets() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const rows = await this.db
        .knex('wb_tariffs')
        .whereRaw('fetch_date::text = ?', [today])
        .orderBy('box_delivery_coef_expr')
        .select('*');

      const sheetsIdsString = process.env.GOOGLE_SHEETS_IDS || '';
      const sheetsIds = sheetsIdsString.split(',');

      const raw = process.env.GOOGLE_SERVICE_ACCOUNT || '{}';
      let serviceAccount: any = {};

      try {
        serviceAccount = JSON.parse(raw);
      } catch {
        this.logger.error('Failed to parse GOOGLE_SERVICE_ACCOUNT JSON');
        return;
      }

      // нормализуем приватный ключ
      if (typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').replace(/\r/g, '');
      }

      if (!serviceAccount.private_key || !serviceAccount.client_email) {
        this.logger.error('Service account missing private_key or client_email');
        return;
      }

      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });



      const values = [
        ['Дата', 'Склад', 'Регион', 'Доставка base', 'Коэфф доставка', 'Хранение base', 'Коэфф хранение'],
        ...rows.map((row: any) => [
          row.fetch_date,
          row.warehouse_name,
          row.geo_name,
          row.box_delivery_base,
          row.box_delivery_coef_expr,
          row.box_storage_base,
          row.box_storage_coef_expr,
        ]),
      ];

      for (const sheetId of sheetsIds) {
        const trimmedId = sheetId.trim();
        if (!trimmedId) continue;

        await sheets.spreadsheets.values.update({
          spreadsheetId: trimmedId,
          range: 'stocks_coefs!A1',
          valueInputOption: 'RAW',
          requestBody: { values },
        });

        this.logger.log(`Updated sheet: ${trimmedId}`);
      }
    } catch (error: any) {
      this.logger.error('Sheets update failed:', error.message);
    }
  }
}
