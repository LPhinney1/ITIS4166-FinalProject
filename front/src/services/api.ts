// Base API service for making HTTP requests
const baseUrl = import.meta.env.VITE_URL || 'https://bookmark-api-pm6u.onrender.com';

// Helper function to get the auth token from localStorage
const getAuthToken = (): string | null => {
    const auth = localStorage.getItem('authorization');
    return auth ? auth : null;
};

// Helper function to extract the user ID from JWT token
const getUserIdFromToken = (): number | null => {
    try {
        const token = getAuthToken();
        if (!token) return null;

        // Get the payload part of the JWT (second part)
        const base64Url = token.split(' ')[1].split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join(''),
        );

        const payload = JSON.parse(jsonPayload);
        return payload.userId || null;
    } catch (e) {
        console.error('Error extracting user ID from token:', e);
        return null;
    }
};

// Generic fetch function with authentication
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();

    if (!token) {
        throw new Error('Not authenticated');
    }

    const headers = {
        'Content-Type': 'application/json',
        Authorization: token,
        ...options.headers,
    };

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle API errors
    if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            // If we can't parse the error as JSON, just use the default message
        }
        throw new Error(errorMessage);
    }

    return response.json();
}

// API methods
export const api = {
    // Get current user ID
    getCurrentUserId: () => getUserIdFromToken(),

    // Collection methods
    collections: {
        getAll: () => fetchWithAuth('/api/collections'),
        getById: (id: number) => fetchWithAuth(`/api/collections/${id}`),
        create: (data: { name: string; description?: string }) => {
            const userId = getUserIdFromToken();
            if (!userId) throw new Error('User ID not available');

            return fetchWithAuth('/api/collections', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: userId,
                    name: data.name,
                    description: data.description || '',
                }),
            });
        },
        update: (id: number, data: { name?: string; description?: string }) =>
            fetchWithAuth('/api/collections', {
                method: 'PUT',
                body: JSON.stringify({
                    id,
                    ...data,
                }),
            }),
        delete: (id: number) =>
            fetchWithAuth(`/api/collections/${id}`, {
                method: 'DELETE',
            }),
        getBookmarks: (collectionId: number) => fetchWithAuth(`/api/collections/${collectionId}/bookmarks`),
        addBookmark: (collectionId: number, bookmarkId: number) =>
            fetchWithAuth(`/api/collections/${collectionId}/bookmarks`, {
                method: 'POST',
                body: JSON.stringify({ bookmark_id: bookmarkId }),
            }),
        removeBookmark: (collectionId: number, bookmarkId: number) =>
            fetchWithAuth(`/api/collections/${collectionId}/bookmarks/${bookmarkId}`, {
                method: 'DELETE',
            }),
    },

    // Bookmark methods
    bookmarks: {
        getAll: () => fetchWithAuth('/api/bookmarks'),
        getById: (id: number) => fetchWithAuth(`/api/bookmarks/${id}`),
        create: (data: { title: string; url: string; description?: string }) => {
            const userId = getUserIdFromToken();
            if (!userId) throw new Error('User ID not available');

            return fetchWithAuth('/api/bookmarks', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: userId,
                    title: data.title,
                    url: data.url,
                    description: data.description || '',
                }),
            });
        },
        update: (id: number, data: { title?: string; url?: string; description?: string }) =>
            fetchWithAuth('/api/bookmarks', {
                method: 'PUT',
                body: JSON.stringify({
                    id,
                    ...data,
                }),
            }),
        delete: (id: number) =>
            fetchWithAuth(`/api/bookmarks/${id}`, {
                method: 'DELETE',
            }),
        getTags: (bookmarkId: number) => fetchWithAuth(`/api/bookmarks/${bookmarkId}/tags`),
        addTag: (bookmarkId: number, tagId: number) =>
            fetchWithAuth(`/api/bookmarks/${bookmarkId}/tags`, {
                method: 'POST',
                body: JSON.stringify({ tag_id: tagId }),
            }),
        removeTag: (bookmarkId: number, tagId: number) =>
            fetchWithAuth(`/api/bookmarks/${bookmarkId}/tags/${tagId}`, {
                method: 'DELETE',
            }),
    },

    // Tag methods
    tags: {
        getAll: () => fetchWithAuth('/api/tags'),
        getById: (id: number) => fetchWithAuth(`/api/tags/${id}`),
        create: (data: { name: string; slug: string }) =>
            fetchWithAuth('/api/tags', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        update: (id: number, data: { name?: string; slug?: string }) =>
            fetchWithAuth('/api/tags', {
                method: 'PUT',
                body: JSON.stringify({
                    id,
                    ...data,
                }),
            }),
        delete: (id: number) =>
            fetchWithAuth(`/api/tags/${id}`, {
                method: 'DELETE',
            }),
        getBookmarks: (tagId: number) => fetchWithAuth(`/api/tags/${tagId}/bookmarks`),
    },

    // User methods - just including the login method for completeness
    users: {
        login: async (username: string, password: string) => {
            const response = await fetch(`${baseUrl}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            localStorage.setItem('authorization', `Bearer ${data.token}`);
            return data.token;
        },
    },
};
