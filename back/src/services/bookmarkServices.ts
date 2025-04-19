import * as bookmarkRepositories from '../repositories/bookmarkRepositories.js';
import { Bookmark } from '../repositories/bookmarkRepositories.js';

export async function getAllBookmarks() {
    return bookmarkRepositories.getAllBookmarks();
}

export async function getBookmarkById(id: number) {
    return bookmarkRepositories.getBookmarkById(id);
}

export async function createBookmark(newBookmark: Partial<Bookmark>): Promise<Bookmark> {
    if (!newBookmark.user_id || !newBookmark.title || !newBookmark.url) {
        return Promise.reject(new Error('user_id, title, and url are required'));
    }

    return bookmarkRepositories.createBookmark({
        user_id: newBookmark.user_id,
        title: newBookmark.title,
        url: newBookmark.url,
        description: newBookmark.description ?? '',
    });
}

export async function updateBookmark(updatedBookmark: Partial<Bookmark>): Promise<Bookmark> {
    if (!updatedBookmark.id) return Promise.reject(new Error('ID required'));

    const existing = await bookmarkRepositories.getBookmarkById(updatedBookmark.id);
    if (!existing) return Promise.reject(new Error('ID did not match any bookmarks'));

    return bookmarkRepositories.updateBookmark({
        id: updatedBookmark.id,
        title: updatedBookmark.title ?? existing.title,
        url: updatedBookmark.url ?? existing.url,
        description: updatedBookmark.description ?? existing.description,
        user_id: updatedBookmark.user_id ?? existing.user_id,
    });
}

export async function deleteBookmark(id: number) {
    const exists = await bookmarkRepositories.getBookmarkById(id);
    if (!exists) return Promise.reject(new Error('ID did not match any bookmark'));
    return bookmarkRepositories.deleteBookmark(id);
}

//relationships
export async function addTagToBookmark(bookmark_id: number, tag_id: number) {
    return bookmarkRepositories.addTagToBookmark(bookmark_id, tag_id);
}

export async function getTagsForBookmark(bookmarkId: number) {
    const exists = await bookmarkRepositories.getBookmarkById(bookmarkId);
    if (!exists) return Promise.reject(new Error('Bookmark not found'));
    return bookmarkRepositories.getTagsForBookmark(bookmarkId);
}

export async function getCollectionsForBookmark(bookmarkId: number) {
    const exists = await bookmarkRepositories.getBookmarkById(bookmarkId);
    if (!exists) return Promise.reject(new Error('Bookmark not found'));
    return bookmarkRepositories.getCollectionsForBookmark(bookmarkId);
}
