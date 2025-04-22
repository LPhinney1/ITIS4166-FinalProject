import * as path from 'path';
import { promises as fs } from 'fs';
import { Migrator, FileMigrationProvider } from 'kysely';
import { db } from './db.js';

export const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(import.meta.dirname, 'migrations'),
    }),
});

export async function migrateToLatest() {
    const { error, results } = await migrator.migrateToLatest();

    let migrationErrored = false;
    results?.forEach((it) => {
        if (it.status === 'Success') {
            console.log(`Database migration "${it.migrationName}": \x1b[32mSUCCESS\x1b[0m\n`);
        } else if (it.status === 'Error') {
            console.error(`Database migration "${it.migrationName}": \x1b[31mERROR\x1b[0m`);
            migrationErrored = true;
        }
    });

    if (error || migrationErrored) {
        console.error('Failed to migrate.');
        console.error(error);
        process.exit(1);
    }
}
