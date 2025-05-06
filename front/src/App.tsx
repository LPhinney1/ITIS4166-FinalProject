import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { useUser } from './context/UseUser';

function App() {
    const { token, isLoading, login } = useUser();

    if (isLoading) {
        return <div className="loading-screen">Loading...</div>;
    }

    if (!token) {
        return (
            <div style={{ padding: '2em', maxWidth: '500px', margin: '0 auto' }}>
                <h2>Please log in or register to access the app.</h2>
                <AuthForm onLogin={login} />
            </div>
        );
    }

    return <Dashboard />;
}

export default App;
