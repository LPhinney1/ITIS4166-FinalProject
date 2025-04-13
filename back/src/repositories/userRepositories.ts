import { db } from '../database/db.js';
import { randomUUID } from 'node:crypto';

export type User = {
    id: number;
    username: string;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
};

export async function getAllUsers(): Promise<Partial<User[]>> {
    const users = await db
        .selectFrom('users')
        .select(['id', 'username', 'email', 'password', 'created_at', 'updated_at'])
        .execute();
    const allUsers: User[] = [];
    for (const user of users) allUsers.push(<User>user);
    return allUsers;
}
export async function getUserById(id: number): Promise<Partial<User>> {
    return await db
        .selectFrom('users')
        .select(['id', 'username', 'email', 'password', 'created_at', 'updated_at'])
        .orderBy('id', 'asc')
        .where('id', '=', id)
        .executeTakeFirstOrThrow();
}

export async function createUser(user: { username: string; email: string }): Promise<User> {
    return await db.transaction().execute(async (trx) => {
        return (await trx
            .insertInto('users')
            .columns(['username', 'email', 'password', 'created_at', 'updated_at'])
            .values({
                username: user.username,
                email: user.email,
                password: randomUUID(),
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            })
            .returning(['id', 'username', 'email', 'password', 'created_at', 'updated_at'])
            .executeTakeFirstOrThrow()) as User;
    });
}

export async function updateUser(user: Partial<User>): Promise<User> {
    return await db.transaction().execute(async (trx) => {
        return (await trx
            .updateTable('users')
            .set({
                username: user.username,
                email: user.email,
                updated_at: new Date(Date.now()),
            })
            .where('id', '=', Number(user.id))
            .returning(['id', 'username', 'email', 'password', 'created_at', 'updated_at'])
            .executeTakeFirstOrThrow()) as User;
    });
}

export async function deleteUser(id: number) {
    return await db.transaction().execute(async (trx) => {
        return await trx.deleteFrom('users').where('id', '=', id).executeTakeFirst();
    });
}
