import { db } from '../database/db.js';

export type Collection = {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    created_at: Date;
    updated_at: Date;
};

export async function getAllCollections(): Promise<Collection[]> {
    return (await db
        .selectFrom('collections')
        .select(['id', 'user_id', 'name', 'description', 'created_at', 'updated_at'])
        .orderBy('id', 'asc')
        .execute()) as Collection[];
}

export async function getCollectionById(id: number): Promise<Collection | undefined> {
    return await db
        .selectFrom('collections')
        .select(['id', 'user_id', 'name', 'description', 'created_at', 'updated_at'])
        .where('id', '=', id)
        .executeTakeFirst();
}

export async function createCollection(collection: {
    user_id: number;
    name: string;
    description?: string;
}): Promise<Collection> {
    return await db.transaction().execute(async (trx) => {
        return (await trx
            .insertInto('collections')
            .values({
                user_id: collection.user_id,
                name: collection.name,
                description: collection.description ?? '',
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning(['id', 'user_id', 'name', 'description', 'created_at', 'updated_at'])
            .executeTakeFirstOrThrow()) as Collection;
    });
}

export async function updateCollection(collection: Partial<Collection>): Promise<Collection> {
    return await db.transaction().execute(async (trx) => {
        return (await trx
            .updateTable('collections')
            .set({
                name: collection.name,
                description: collection.description,
                updated_at: new Date(),
            })
            .where('id', '=', Number(collection.id))
            .returning(['id', 'user_id', 'name', 'description', 'created_at', 'updated_at'])
            .executeTakeFirstOrThrow()) as Collection;
    });
}

export async function deleteCollection(id: number) {
    return await db.transaction().execute(async (trx) => {
        return await trx.deleteFrom('collections').where('id', '=', id).executeTakeFirst();
    });
}

//relationships
export async function addBookmarkToCollection(collection_id: number, bookmark_id: number) {
    return await db
        .insertInto('collection_bookmarks')
        .values({
            collection_id,
            bookmark_id,
            created_at: new Date(),
        })
        .returning(['collection_id', 'bookmark_id', 'created_at'])
        .executeTakeFirst();
}

export async function getBookmarksInCollection(collectionId: number) {
    return await db
        .selectFrom('collection_bookmarks')
        .innerJoin('bookmarks', 'collection_bookmarks.bookmark_id', 'bookmarks.id')
        .select([
            'bookmarks.id',
            'bookmarks.user_id',
            'bookmarks.title',
            'bookmarks.url',
            'bookmarks.description',
            'bookmarks.created_at',
            'bookmarks.updated_at',
        ])
        .where('collection_bookmarks.collection_id', '=', collectionId)
        .execute();
}
