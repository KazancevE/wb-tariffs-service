import { Injectable, OnModuleInit } from '@nestjs/common';
import { Knex, knex } from 'knex';
import config from './knexfile';

@Injectable()
export class DatabaseService implements OnModuleInit {
  public knex: Knex;

  constructor() {
    this.knex = knex(config.development);
  }

  async onModuleInit() {
    await this.knex.migrate.latest();
  }
}
