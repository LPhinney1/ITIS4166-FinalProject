import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './types.js';

const dialect = new PostgresDialect({
    pool: new pg.Pool({
        host: 'dpg-d00hhepr0fns73e9vfng-a',
        database: 'projectdb_t4l0',
        user: 'database_service',
        password: '2MNd4DisGbgSExsnzgcn3c2F8wID7qha',
        port: 5432,
        max: 10,
    }),
});

export const db = new Kysely<Database>({
    dialect,
});
