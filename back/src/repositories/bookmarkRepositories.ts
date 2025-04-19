import { db } from '../database/db.js';

export type Bookmark = {
    id: number;
    user_id: number;
    title: string;
    url: string;
    description: string | null;
    created_at: Date;
    updated_at: Date;
};

export async function getAllBookmarks(): Promise<Partial<Bookmark[]>> {
    const bookmarks = await db
        .selectFrom('bookmarks')
        .select(['id', 'user_id', 'title', 'url', 'description', 'created_at', 'updated_at'])
        .execute();
    const allBookmarks: Bookmark[] = [];
    for (const bookmark of bookmarks) allBookmarks.push(<Bookmark>bookmark);
    return allBookmarks;
}

export async function getBookmarkById(id: number): Promise<Partial<Bookmark>> {
    return await db
        .selectFrom('bookmarks')
        .select(['id', 'user_id', 'title', 'url', 'description', 'created_at', 'updated_at'])
        .where('id', '=', id)
        .executeTakeFirstOrThrow();
}

export async function createBookmark(bookmark: {
    user_id: number;
    title: string;
    url: string;
    description?: string;
}): Promise<Bookmark> {
    return await db.transaction().execute(async (trx) => {
        return (await trx
            .insertInto('bookmarks')
            .columns(['user_id', 'title', 'url', 'description', 'created_at', 'updated_at'])
            .values({
                user_id: bookmark.user_id,
                title: bookmark.title,
                url: bookmark.url,
                description: bookmark.description ?? '',
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning(['id', 'user_id', 'title', 'url', 'description', 'created_at', 'updated_at'])
            .executeTakeFirstOrThrow()) as Bookmark;
    });
}

export async function updateBookmark(bookmark: Partial<Bookmark>): Promise<Bookmark> {
    return await db.transaction().execute(async (trx) => {
        return (await trx
            .updateTable('bookmarks')
            .set({
                title: bookmark.title,
                url: bookmark.url,
                description: bookmark.description,
                user_id: bookmark.user_id,
                updated_at: new Date(),
            })
            .where('id', '=', Number(bookmark.id))
            .returning(['id', 'user_id', 'title', 'url', 'description', 'created_at', 'updated_at'])
            .executeTakeFirstOrThrow()) as Bookmark;
    });
}

export async function deleteBookmark(id: number) {
    return await db.transaction().execute(async (trx) => {
        return await trx.deleteFrom('bookmarks').where('id', '=', id).executeTakeFirst();
    });
}

//relationships
export async function addTagToBookmark(bookmark_id: number, tag_id: number) {
    return await db
        .insertInto('bookmark_tags')
        .values({
            bookmark_id,
            tag_id,
            created_at: new Date(),
        })
        .returning(['bookmark_id', 'tag_id', 'created_at'])
        .executeTakeFirst();
}

export async function getTagsForBookmark(bookmarkId: number) {
    return await db
        .selectFrom('bookmark_tags')
        .innerJoin('tags', 'bookmark_tags.tag_id', 'tags.id')
        .select(['tags.id', 'tags.name', 'tags.slug', 'tags.created_at', 'tags.updated_at'])
        .where('bookmark_tags.bookmark_id', '=', bookmarkId)
        .execute();
}

export async function getCollectionsForBookmark(bookmarkId: number) {
    return await db
        .selectFrom('collection_bookmarks')
        .innerJoin('collections', 'collection_bookmarks.collection_id', 'collections.id')
        .select([
            'collections.id',
            'collections.user_id',
            'collections.name',
            'collections.description',
            'collections.created_at',
            'collections.updated_at',
        ])
        .where('collection_bookmarks.bookmark_id', '=', bookmarkId)
        .execute();
}
