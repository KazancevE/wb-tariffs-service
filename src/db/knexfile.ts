import { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'wb_tariffs_db',
      user: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'pass',
    },
    migrations: {
      directory: './migrations',
    },
  },
};

export default config;
