import React, { createContext, JSX, useContext, useEffect, useState } from 'react';

export type UserContextType = {
    token: string | null;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }): JSX.Element {
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedValue = localStorage.getItem('authorization');
        if (!storedValue || !storedValue.startsWith('Bearer ')) {
            setIsLoading(false);
            return;
        }
        const tokenFromStorage = storedValue.slice(7); // Remove 'Bearer ' prefix
        setToken(tokenFromStorage);
        setIsLoading(false);
    }, []);

    function login(token: string): void {
        setToken(token);
        if (token) {
            localStorage.setItem('authorization', `Bearer ${token}`);
        }
    }

    function logout(): void {
        setToken(null);
        localStorage.removeItem('authorization');
    }

    return (
        <UserContext.Provider value={{ token, login, logout, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser(): UserContextType {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('Cannot use useUser outside of UserProvider');
    }
    return context;
}
