import { useState } from 'react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { useUser } from './context/UseUser';
import './App.css';

function App() {
    const { token, isLoading, login, logout } = useUser();

    if (isLoading) {
        return <div className="loading-screen">Loading...</div>;
    }

    // Show the login form if not authenticated
    if (!token) {
        return (
            <div style={{ padding: '2em', maxWidth: '500px', margin: '0 auto' }}>
                <h2>Please log in or register to access the app.</h2>
                <AuthForm onLogin={login} />
            </div>
        );
    }

    // Show the dashboard if authenticated
    return <Dashboard />;
}

export default App;
