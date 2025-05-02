import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import AuthForm from './components/AuthForm.tsx';
import { useUser } from './context/UseUser.tsx';

function App() {
    const [healthData, setHealthData] = useState<null | Record<string, any>>(null);
    const baseUrl = import.meta.env.VITE_URL;
    const { token, isLoading, login, logout } = useUser();

    const checkHealth = async () => {
        const startTime = performance.now();
        try {
            const res = await fetch(`${baseUrl}/health`);
            const data = await res.json();
            console.log(`Health check took ${((performance.now() - startTime) / 1000).toFixed(2)} seconds`);
            setHealthData(data);
        } catch (error) {
            console.error('Health check failed:', error);
            console.log(`Health check failed in ${((performance.now() - startTime) / 1000).toFixed(2)} seconds`);
            setHealthData({ error: 'Failed to fetch health data from API' });
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!token) {
        return (
            <div style={{ padding: '2em', maxWidth: '500px', margin: '0 auto' }}>
                <h2>Please log in or register to access the app.</h2>
                <AuthForm onLogin={login} />
            </div>
        );
    }

    return (
        <div style={{ padding: '1em', textAlign: 'center' }}>
            <button onClick={logout} style={{ float: 'right', marginRight: '1em' }}>
                Logout
            </button>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>ITIS4166 Final Project</h1>
            <h2>Frontend － React + Vite</h2>
            <h2>
                <a href="https://bookmark-api-pm6u.onrender.com/health" target="_blank">
                    Backend API
                </a>{' '}
                － Express + PostgreSQL + Kysely
            </h2>
            <h3>Deployed on Render</h3>
            <hr style={{ margin: '1em' }} />

            <div>
                <button
                    onClick={checkHealth}
                    style={{
                        backgroundColor: 'olivedrab',
                        color: '#fff',
                        padding: '0.5em 1em',
                    }}>
                    Run Health Check
                </button>
                {healthData && (
                    <pre
                        style={{
                            textAlign: 'left',
                            margin: '1em auto',
                            padding: '1em',
                            maxWidth: '600px',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                        }}>
                        {JSON.stringify(healthData, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
}

export default App;
