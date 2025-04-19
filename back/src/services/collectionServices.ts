import * as collectionRepositories from '../repositories/collectionRepositories.js';
import { Collection } from '../repositories/collectionRepositories.js';

export async function getAllCollections() {
    return collectionRepositories.getAllCollections();
}

export async function getCollectionById(id: number) {
    return collectionRepositories.getCollectionById(id);
}

export async function createCollection(newCollection: Partial<Collection>): Promise<Collection> {
    if (!newCollection.user_id || !newCollection.name) {
        return Promise.reject(new Error('user_id and name are required'));
    }

    return collectionRepositories.createCollection({
        user_id: newCollection.user_id,
        name: newCollection.name,
        description: newCollection.description ?? '',
    });
}

export async function updateCollection(updated: Partial<Collection>): Promise<Collection> {
    if (!updated.id) return Promise.reject(new Error('ID required'));

    const existing = await collectionRepositories.getCollectionById(updated.id);
    if (!existing) return Promise.reject(new Error('ID did not match any collections'));

    return collectionRepositories.updateCollection({
        id: updated.id,
        name: updated.name ?? existing.name,
        description: updated.description ?? existing.description,
    });
}

export async function deleteCollection(id: number) {
    const existing = await collectionRepositories.getCollectionById(id);
    if (!existing) return Promise.reject(new Error('ID did not match any collection'));
    return collectionRepositories.deleteCollection(id);
}

//relationships
export async function addBookmarkToCollection(collection_id: number, bookmark_id: number) {
    return collectionRepositories.addBookmarkToCollection(collection_id, bookmark_id);
}

export async function getBookmarksInCollection(collectionId: number) {
    const exists = await collectionRepositories.getCollectionById(collectionId);
    if (!exists) return Promise.reject(new Error('Collection not found'));
    return collectionRepositories.getBookmarksInCollection(collectionId);
}
