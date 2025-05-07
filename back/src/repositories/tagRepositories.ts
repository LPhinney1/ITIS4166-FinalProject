import { db } from '../database/db.js';

export type Tag = {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    created_at: Date;
    updated_at: Date;
};

export async function getAllTags(): Promise<Tag[]> {
    return (await db
        .selectFrom('tags')
        .select(['id', 'user_id', 'name', 'slug', 'created_at', 'updated_at'])
        .orderBy('id', 'asc')
        .execute()) as Tag[];
}

export async function getTagById(id: number): Promise<Tag | undefined> {
    return await db
        .selectFrom('tags')
        .select(['id', 'user_id', 'name', 'slug', 'created_at', 'updated_at'])
        .where('id', '=', id)
        .executeTakeFirst();
}

export async function createTag(tag: { user_id: number; name: string; slug: string }): Promise<Tag> {
    return await db.transaction().execute(async (trx) => {
        return (await trx
            .insertInto('tags')
            .values({
                user_id: tag.user_id,
                name: tag.name,
                slug: tag.slug,
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning(['id', 'user_id', 'name', 'slug', 'created_at', 'updated_at'])
            .executeTakeFirstOrThrow()) as Tag;
    });
}

export async function updateTag(tag: Partial<Tag>): Promise<Tag> {
    return await db.transaction().execute(async (trx) => {
        return (await trx
            .updateTable('tags')
            .set({
                name: tag.name,
                slug: tag.slug,
                updated_at: new Date(),
            })
            .where('id', '=', Number(tag.id))
            .returning(['id', 'user_id', 'name', 'slug', 'created_at', 'updated_at'])
            .executeTakeFirstOrThrow()) as Tag;
    });
}

export async function deleteTag(id: number) {
    return await db.transaction().execute(async (trx) => {
        return await trx.deleteFrom('tags').where('id', '=', id).executeTakeFirst();
    });
}

//relationships
export async function getBookmarksForTag(tagId: number) {
    return await db
        .selectFrom('bookmark_tags')
        .innerJoin('bookmarks', 'bookmark_tags.bookmark_id', 'bookmarks.id')
        .select([
            'bookmarks.id',
            'bookmarks.user_id',
            'bookmarks.title',
            'bookmarks.url',
            'bookmarks.description',
            'bookmarks.created_at',
            'bookmarks.updated_at',
        ])
        .where('bookmark_tags.tag_id', '=', tagId)
        .execute();
}
