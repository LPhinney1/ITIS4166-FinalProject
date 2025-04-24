import * as userRepositories from '../repositories/userRepositories.js';
import { User } from '../repositories/userRepositories.js';
import jwt from 'jsonwebtoken';

export async function getAllUsers() {
    return userRepositories.getAllUsers();
}

export async function getUserById(id: number) {
    return userRepositories.getUserById(id);
}

export async function createUser(newUser: Partial<User>): Promise<User> {
    if (!newUser.username || !newUser.email) return Promise.reject(new Error('username and email required'));
    return userRepositories.createUser({ username: newUser.username, email: newUser.email });
}

export async function updateUser(updatedUser: Partial<User>): Promise<User> {
    if (!updatedUser.id) return Promise.reject(new Error('ID required'));
    if (!(await userRepositories.getUserById(updatedUser.id)))
        return Promise.reject(new Error('ID did not match any users'));

    return userRepositories.updateUser({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        password: updatedUser.password,
    });
}

export async function deleteUser(id: number) {
    if (!(await userRepositories.getUserById(id))) return Promise.reject(new Error('ID did not match any user'));
    return userRepositories.deleteUser(id);
}

export async function login(username: string, password: string): Promise<string> {
    const user = await userRepositories.getUserByUsername(username);
    if (!user || user.password !== password) {
        throw new Error('Invalid credentials');
    }
    return jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET!, {
        expiresIn: '24h',
    });
}