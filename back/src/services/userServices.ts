import * as userRepositories from '../repositories/userRepositories.js';
import { User } from '../repositories/userRepositories.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function getAllUsers() {
    return userRepositories.getAllUsers();
}

export async function getUserById(id: number) {
    return userRepositories.getUserById(id);
}

export async function createUser(newUser: Partial<User>): Promise<User> {
    const { username, email, password } = newUser;
    if (!username || !email || !password) {
        return Promise.reject(new Error('username, email, and password are required'));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return userRepositories.createUser({
        username,
        email,
        password: hashedPassword,
    });
}

export async function updateUser(updatedUser: Partial<User>): Promise<User> {
    if (!updatedUser.id) return Promise.reject(new Error('ID required'));

    const existingUser = await userRepositories.getUserById(updatedUser.id);
    if (!existingUser) return Promise.reject(new Error('ID did not match any users'));

    let hashedPassword = existingUser.password;
    if (updatedUser.password) {
        hashedPassword = await bcrypt.hash(updatedUser.password, 10);
    }

    return userRepositories.updateUser({
        id: updatedUser.id,
        username: updatedUser.username ?? existingUser.username,
        email: updatedUser.email ?? existingUser.email,
        password: hashedPassword,
    });
}

export async function deleteUser(id: number) {
    if (!(await userRepositories.getUserById(id))) return Promise.reject(new Error('ID did not match any user'));
    return userRepositories.deleteUser(id);
}

export async function login(username: string, password: string): Promise<string> {
    const user = await userRepositories.getUserByUsername(username);
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const passwordMatch = await bcrypt.compare(password, <string>user.password);
    if (!passwordMatch) {
        throw new Error('Invalid credentials');
    }
    return jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET!, {
        expiresIn: '24h',
    });
}
