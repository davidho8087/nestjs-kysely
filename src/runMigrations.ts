import * as path from 'path';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from 'kysely';
import { config as loadEnv } from 'dotenv';

console.log('Loading environment variables...');
loadEnv(); // Load environment variables

console.log('Initializing Config Service...');

function getConfig(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value!;
}

console.log('Config Service Initialized');

(async () => {
  try {
    console.log('Initializing Database...');
    const database = new Kysely({
      dialect: new PostgresDialect({
        pool: new Pool({
          host: getConfig('POSTGRES_HOST'),
          port: Number(getConfig('POSTGRES_PORT')),
          user: getConfig('POSTGRES_USER'),
          password: getConfig('POSTGRES_PASSWORD'),
          database: getConfig('POSTGRES_DB'),
        }),
      }),
    });
    console.log('Database Initialized');

    console.log('Initializing Migrator...');
    const migrator = new Migrator({
      db: database,
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(__dirname, 'migrations'),
      }),
    });
    console.log('Migrator Initialized');

    console.log('Running Migrations...');
    const { error, results } = await migrator.migrateToLatest();
    console.log('Migrations Complete');

    results?.forEach((migrationResult) => {
      if (migrationResult.status === 'Success') {
        console.log(
          `Migration "${migrationResult.migrationName}" was executed successfully`,
        );
      } else if (migrationResult.status === 'Error') {
        console.error(
          `Failed to execute migration "${migrationResult.migrationName}"`,
        );
      }
    });

    if (error) {
      console.error('Failed to migrate', error);
      process.exit(1);
    }

    await database.destroy();
    console.log('Database Connection Destroyed');
  } catch (err) {
    console.error('An error occurred:', err);
    process.exit(1);
  }
})();
