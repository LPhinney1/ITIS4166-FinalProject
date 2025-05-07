import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { useUser } from './context/UseUser';
import './App.css';

function App() {
    const { token, isLoading, login } = useUser();

    if (isLoading) {
        return <div className="loading-screen">
            <h1>Loading...</h1>
        </div>;
    }

    if (!token) {
        return (
            <div style={{ padding: '2em', maxWidth: '500px', margin: '0 auto' }}>
                <h2>Please log in or register to access the app.</h2>
                <AuthForm onLogin={login} />
                <em style={{ fontSize: 'small' }}>Backend may take ~20 seconds to spin up if inactive for long period.</em>
            </div>
        );
    }

    return <Dashboard />;
}

export default App;
