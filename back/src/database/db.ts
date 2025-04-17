import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './types.js';

const dialect = new PostgresDialect({
    pool: new pg.Pool({
        database: 'projectdb_t4l0',
        host: 'postgresql://database_service:2MNd4DisGbgSExsnzgcn3c2F8wID7qha@dpg-d00hhepr0fns73e9vfng-a/projectdb_t4l0',
        user: 'database_service',
        password: '2MNd4DisGbgSExsnzgcn3c2F8wID7qha',
        port: 5432,
        max: 10,
    }),
});

export const db = new Kysely<Database>({
    dialect,
});
