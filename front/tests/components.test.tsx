import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { UserProvider } from '../src/context/UseUser';
import { DataRefreshProvider } from '../src/context/DataRefreshContext';
import AuthForm from '../src/components/AuthForm';
import BookmarksTab from '../src/tabs/BookmarksTab';
import CollectionsTab from '../src/tabs/CollectionsTab';
import App from '../src/App';

// Mock the API service
vi.mock('../src/services/api', () => ({
    api: {
        getCurrentUserId: vi.fn().mockReturnValue(1),
        users: {
            login: vi.fn().mockImplementation((username, password) => {
                if (username === 'testuser' && password === 'password123') {
                    return Promise.resolve({ token: 'mock-token-123' });
                } else {
                    return Promise.reject(new Error('Invalid credentials'));
                }
            }),
        },
        bookmarks: {
            getAll: vi.fn().mockResolvedValue([
                {
                    id: 1,
                    user_id: 1,
                    title: 'Test Bookmark',
                    url: 'https://example.com',
                    description: 'Test description',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ]),
            create: vi.fn().mockImplementation((data) =>
                Promise.resolve({
                    id: 2,
                    user_id: 1,
                    ...data,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }),
            ),
            getTags: vi.fn().mockResolvedValue([]),
        },
        collections: {
            getAll: vi.fn().mockResolvedValue([
                {
                    id: 1,
                    user_id: 1,
                    name: 'Test Collection',
                    description: 'Test collection description',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    bookmarkCount: 2,
                },
            ]),
            create: vi.fn().mockImplementation((data) =>
                Promise.resolve({
                    id: 2,
                    user_id: 1,
                    ...data,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }),
            ),
        },
        tags: {
            getAll: vi.fn().mockResolvedValue([]),
        },
    },
}));

// Helper wrapper components
const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <UserProvider>
        <DataRefreshProvider>{children}</DataRefreshProvider>
    </UserProvider>
);

// Tests
describe('AuthForm Component', () => {
    const mockLoginFn = vi.fn();

    beforeEach(() => {
        mockLoginFn.mockClear();
    });

    test('renders login form by default', () => {
        render(<AuthForm onLogin={mockLoginFn} />);

        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Register')).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    test('switches to registration form', async () => {
        render(<AuthForm onLogin={mockLoginFn} />);

        fireEvent.click(screen.getByText('Register'));

        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });

    test('handles successful login', async () => {
        const { api } = await import('../src/services/api');

        render(<AuthForm onLogin={mockLoginFn} />);

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(api.users.login).toHaveBeenCalledWith('testuser', 'password123');
            expect(mockLoginFn).toHaveBeenCalledWith('mock-token-123');
        });
    });
});

describe('BookmarksTab Component', () => {
    test('displays bookmarks', async () => {
        render(
            <AllProviders>
                <BookmarksTab />
            </AllProviders>,
        );

        await waitFor(() => {
            expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
        });
    });

    test('shows add bookmark modal', async () => {
        render(
            <AllProviders>
                <BookmarksTab />
            </AllProviders>,
        );

        fireEvent.click(screen.getByText('Add Bookmark'));

        await waitFor(() => {
            expect(screen.getByText('Add Bookmark')).toBeInTheDocument();
            expect(screen.getByLabelText('URL')).toBeInTheDocument();
            expect(screen.getByLabelText('Title')).toBeInTheDocument();
        });
    });
});

describe('CollectionsTab Component', () => {
    test('displays collections', async () => {
        render(
            <AllProviders>
                <CollectionsTab />
            </AllProviders>,
        );

        await waitFor(() => {
            expect(screen.getByText('Test Collection')).toBeInTheDocument();
            expect(screen.getByText('Test collection description')).toBeInTheDocument();
            expect(screen.getByText('2 bookmarks')).toBeInTheDocument();
        });
    });

    test('shows add collection modal', async () => {
        render(
            <AllProviders>
                <CollectionsTab />
            </AllProviders>,
        );

        fireEvent.click(screen.getByText('Add Collection'));

        await waitFor(() => {
            expect(screen.getByText('Create Collection')).toBeInTheDocument();
            expect(screen.getByLabelText('Name')).toBeInTheDocument();
            expect(screen.getByLabelText('Description')).toBeInTheDocument();
        });
    });
});

describe('App Component', () => {
    test('shows login screen when not authenticated', () => {
        // Mock useUser to return no token
        vi.mock('../src/context/UseUser', () => ({
            useUser: vi.fn().mockReturnValue({
                token: null,
                isLoading: false,
                login: vi.fn(),
                logout: vi.fn(),
            }),
            UserProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        }));

        render(<App />);
        expect(screen.getByText('BookmarkHub')).toBeInTheDocument();
        expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    test('shows dashboard when authenticated', async () => {
        // Mock useUser to return a token
        vi.mock('../src/context/UseUser', () => ({
            useUser: vi.fn().mockReturnValue({
                token: 'mock-token',
                isLoading: false,
                login: vi.fn(),
                logout: vi.fn(),
            }),
            UserProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        }));

        render(<App />);

        // Should show dashboard components
        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Logout')).toBeInTheDocument();
        });
    });
});
