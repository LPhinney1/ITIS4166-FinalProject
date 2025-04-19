import * as tagRepositories from '../repositories/tagRepositories.js';
import { Tag } from '../repositories/tagRepositories.js';

export async function getAllTags() {
    return tagRepositories.getAllTags();
}

export async function getTagById(id: number) {
    return tagRepositories.getTagById(id);
}

export async function createTag(newTag: Partial<Tag>): Promise<Tag> {
    if (!newTag.name || !newTag.slug) {
        return Promise.reject(new Error('name and slug are required'));
    }

    return tagRepositories.createTag({
        name: newTag.name,
        slug: newTag.slug,
    });
}

export async function updateTag(updatedTag: Partial<Tag>): Promise<Tag> {
    if (!updatedTag.id) return Promise.reject(new Error('ID required'));

    const existing = await tagRepositories.getTagById(updatedTag.id);
    if (!existing) return Promise.reject(new Error('ID did not match any tags'));

    return tagRepositories.updateTag({
        id: updatedTag.id,
        name: updatedTag.name ?? existing.name,
        slug: updatedTag.slug ?? existing.slug,
    });
}

export async function deleteTag(id: number) {
    const exists = await tagRepositories.getTagById(id);
    if (!exists) return Promise.reject(new Error('ID did not match any tag'));
    return tagRepositories.deleteTag(id);
}

//relationships
export async function getBookmarksForTag(tagId: number) {
    const exists = await tagRepositories.getTagById(tagId);
    if (!exists) return Promise.reject(new Error('Tag not found'));
    return tagRepositories.getBookmarksForTag(tagId);
}
