import * as dotenv from 'dotenv'; dotenv.config();
import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './types.js';

const dialect = new PostgresDialect({
    pool: new pg.Pool({
        host: process.env.HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PWORD,
        port: 5432,
        max: 10,
    }),
});

export const db = new Kysely<Database>({
    dialect,
});
