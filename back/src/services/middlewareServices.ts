import jwt from 'jsonwebtoken';
import { getUserById } from './userServices.js';

export async function verifyAuthToken(token: string): Promise<number> {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
        const user = await getUserById(decoded.userId);
        if (!user) throw new Error('User not found');
        return decoded.userId;
    } catch (err) {
        throw new Error('Invalid token');
    }
}