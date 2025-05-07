import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { useUser } from './context/UseUser';

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
                <AuthForm onLogin={login} />
                <em style={{ fontSize: 'small', textAlign: 'center', display: 'block' }}>Backend may take ~20 seconds to spin up if inactive for long period.</em>
            </div>
        );
    }

    return <Dashboard />;
}

export default App;
