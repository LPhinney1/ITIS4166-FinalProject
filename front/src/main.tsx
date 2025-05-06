import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { UserProvider } from './context/UseUser.tsx';
import { DataRefreshProvider } from './context/DataRefreshContext';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <UserProvider>
            <DataRefreshProvider>
                <App />
            </DataRefreshProvider>
        </UserProvider>
    </StrictMode>,
);
