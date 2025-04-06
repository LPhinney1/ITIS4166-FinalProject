import { Generated } from 'kysely';

export type Database = {
    users: UserTable;
    bookmarks: BookmarkTable;
    tags: TagTable;
    collections: CollectionTable;
    bookmark_tags: BookmarkTagTable;
    collection_bookmarks: CollectionBookmarkTable;
};

export type UserTable = {
    id: Generated<number>;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
};

export type BookmarkTable = {
    id: Generated<number>;
    user_id: number;
    title: string;
    url: string;
    description: string | null;
    created_at: Date;
    updated_at: Date;
};

export type TagTable = {
    id: Generated<number>;
    name: string;
    slug: string;
    created_at: Date;
    updated_at: Date;
};

export type CollectionTable = {
    id: Generated<number>;
    user_id: number;
    name: string;
    description: string | null;
    created_at: Date;
    updated_at: Date;
};

export type BookmarkTagTable = {
    bookmark_id: number;
    tag_id: number;
    created_at: Date;
};

export type CollectionBookmarkTable = {
    collection_id: number;
    bookmark_id: number;
    created_at: Date;
};