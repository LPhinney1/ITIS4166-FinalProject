import { Generated } from 'kysely';

export type Database = {
    users: UserTable;
    blog_posts: BlogPostTable;
    comments: CommentTable;
    tags: TagTable;
    blog_post_tags: BlogPostTagTable;
};

export type UserTable = {
    id: Generated<number>;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
};

export type BlogPostTable = {
    id: Generated<number>;
    user_id: number;
    title: string;
    slug: string;
    content: string;
    created_at: Date;
    updated_at: Date;
};

export type CommentTable = {
    id: Generated<number>;
    user_id: number;
    post_id: number;
    parent_comment_id: number | null;
    content: string;
    created_at: Date;
    updated_at: Date;
};

export type TagTable = {
    id: Generated<number>;
    name: string;
    slug: string;
};

export type BlogPostTagTable = {
    blog_post_id: number;
    tag_id: number;
};