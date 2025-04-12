import * as repositories from '../repositories/repositories.js';

export async function getAllUsers() {
    return repositories.getAllUsers();
}
