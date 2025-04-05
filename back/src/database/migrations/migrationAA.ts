import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('users')
        .ifNotExists()
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('username', 'varchar(50)', (col) => col.unique().notNull())
        .addColumn('email', 'varchar(255)', (col) => col.unique().notNull())
        .addColumn('password_hash', 'varchar(255)', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .execute();
    console.log('Created table -- users');

    await db.schema
        .createTable('blog_posts')
        .ifNotExists()
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('title', 'varchar(255)', (col) => col.notNull())
        .addColumn('slug', 'varchar(255)', (col) => col.unique().notNull())
        .addColumn('content', 'text', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .execute();
    console.log('Created table --blog_posts');

    await db.schema
        .createTable('comments')
        .ifNotExists()
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('post_id', 'integer', (col) => col.references('blog_posts.id').onDelete('cascade').notNull())
        .addColumn('parent_comment_id', 'integer', (col) => col.references('comments.id').onDelete('set null'))
        .addColumn('content', 'text', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(`now()`).notNull())
        .execute();
    console.log('Created table -- comments');

    await db.schema
        .createTable('tags')
        .ifNotExists()
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(100)', (col) => col.unique().notNull())
        .addColumn('slug', 'varchar(100)', (col) => col.unique().notNull())
        .execute();
    console.log('Created table -- tags');

    await db.schema
        .createTable('blog_post_tags')
        .ifNotExists()
        .addColumn('blog_post_id', 'integer', (col) => col.references('blog_posts.id').onDelete('cascade').notNull())
        .addColumn('tag_id', 'integer', (col) => col.references('tags.id').onDelete('cascade').notNull())
        .addPrimaryKeyConstraint('blog_post_tags_pk', ['blog_post_id', 'tag_id'])
        .execute();
    console.log('Created table -- blog_post_tags\n');
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('users').execute();
}
