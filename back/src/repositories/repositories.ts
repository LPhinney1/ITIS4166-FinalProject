import { db } from '../database/db.js';

export type User = {
    id: number;
    username: string;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
};

export async function getAllUsers(): Promise<Partial<User[]>> {
    const users = await db.selectFrom('users').select(['id', 'username', 'email', 'password', 'created_at', 'updated_at']).execute();
    const allUsers: User[] = [];
    for (const user of users) allUsers.push(<User>user);
    return allUsers;
}
