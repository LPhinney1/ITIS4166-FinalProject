import * as repositories from '../repositories/repositories.js';
import { User } from '../repositories/repositories.js';

export async function getAllUsers() {
    return repositories.getAllUsers();
}

export async function getUserById(id: number) {
    return repositories.getUserById(id);
}

export async function createUser(newUser: Partial<User>): Promise<User> {
    if (!newUser.username || !newUser.email) return Promise.reject(new Error('name and email required'));
    return repositories.createUser({ username: newUser.username, email: newUser.email });
}

export async function updateUser(updatedUser: Partial<User>): Promise<User> {
    if (!updatedUser.id) return Promise.reject(new Error('ID required'));
    if (!(await repositories.getUserById(updatedUser.id)))
        return Promise.reject(new Error('ID did not match any users'));

    return repositories.updateUser({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
    });
}

export async function deleteUser(id: number) {
    if (!(await repositories.getUserById(id))) return Promise.reject(new Error('ID did not match any user'));
    return repositories.deleteUser(id);
}
