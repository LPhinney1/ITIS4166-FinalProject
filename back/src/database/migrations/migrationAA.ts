import { Kysely } from 'kysely';

// eslint-disable-next-line
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('users')
        .ifNotExists()
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('username', 'varchar(50)', (col) => col.unique().notNull())
        .addColumn('email', 'varchar(255)', (col) => col.unique().notNull())
        .addColumn('password', 'varchar(255)', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .execute();
    console.log('Initialized: users');

    await db.schema
        .createTable('bookmarks')
        .ifNotExists()
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('title', 'varchar(255)', (col) => col.notNull())
        .addColumn('url', 'varchar(2048)', (col) => col.notNull())
        .addColumn('description', 'text')
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .execute();
    console.log('Initialized: bookmarks');

    await db.schema
        .createTable('tags')
        .ifNotExists()
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('name', 'varchar(100)', (col) => col.notNull())
        .addColumn('slug', 'varchar(100)', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .execute();
    console.log('Initialized: tags');

    await db.schema
        .createTable('collections')
        .ifNotExists()
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('description', 'text')
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .execute();
    console.log('Initialized: collections');

    await db.schema
        .createTable('bookmark_tags')
        .ifNotExists()
        .addColumn('bookmark_id', 'integer', (col) => col.references('bookmarks.id').onDelete('cascade').notNull())
        .addColumn('tag_id', 'integer', (col) => col.references('tags.id').onDelete('cascade').notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .addPrimaryKeyConstraint('bookmark_tags_pk', ['bookmark_id', 'tag_id'])
        .execute();
    console.log('Initialized: bookmark_tags');

    await db.schema
        .createTable('collection_bookmarks')
        .ifNotExists()
        .addColumn('collection_id', 'integer', (col) => col.references('collections.id').onDelete('cascade').notNull())
        .addColumn('bookmark_id', 'integer', (col) => col.references('bookmarks.id').onDelete('cascade').notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .addPrimaryKeyConstraint('collection_bookmarks_pk', ['collection_id', 'bookmark_id'])
        .execute();
    console.log('Initialized: collection_bookmarks');
}

// eslint-disable-next-line
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('collection_bookmarks').ifExists().execute();
    await db.schema.dropTable('bookmark_tags').ifExists().execute();
    await db.schema.dropTable('collections').ifExists().execute();
    await db.schema.dropTable('tags').ifExists().execute();
    await db.schema.dropTable('bookmarks').ifExists().execute();
    await db.schema.dropTable('users').ifExists().execute();
}
