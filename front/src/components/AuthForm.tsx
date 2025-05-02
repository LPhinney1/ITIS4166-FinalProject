import React, { useState } from 'react';

type Props = {
    onLogin: (token: string) => void;
};

function AuthForm({ onLogin }: Props) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const baseUrl = import.meta.env.VITE_URL;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMsg('');

        if (!username || !password || (isRegistering && !email)) {
            setErrorMsg('All fields are required.');
            return;
        }

        const endpoint = isRegistering ? '/api/users' : '/api/users/login';
        const body = isRegistering ? { username, email, password } : { username, password };

        const res = await fetch(`${baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorText = isRegistering ? 'Registration failed!' : 'Login failed!';
            setErrorMsg(errorText);
            return;
        }

        const data = await res.json();
        onLogin(data.token);
    }

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                maxWidth: '400px',
                margin: '1em auto',
                textAlign: 'left',
            }}>
            <h2>{isRegistering ? 'Register' : 'Login'}</h2>

            <label style={{ display: 'block', marginBottom: '0.5em' }}>
                Username:
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{
                        width: '100%',
                        padding: '0.5em',
                        marginTop: '0.5em',
                    }}
                />
            </label>

            {isRegistering && (
                <label style={{ display: 'block', marginBottom: '0.5em' }}>
                    Email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '0.5em',
                            marginTop: '0.5em',
                        }}
                    />
                </label>
            )}

            <label style={{ display: 'block', marginBottom: '0.5em' }}>
                Password:
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                        width: '100%',
                        padding: '0.5em',
                        marginTop: '0.5em',
                    }}
                />
            </label>

            {errorMsg && <div style={{ color: 'red', marginBottom: '1em' }}>{errorMsg}</div>}

            <button type="submit" style={{ padding: '0.5em 1em', marginRight: '1em' }}>
                {isRegistering ? 'Register' : 'Login'}
            </button>

            <button
                type="button"
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setErrorMsg('');
                }}
                style={{
                    padding: '0.5em 1em',
                    background: 'none',
                    border: 'none',
                    color: 'mediumpurple',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                }}>
                {isRegistering ? 'Already have an account? Log in' : 'New user? Register'}
            </button>
        </form>
    );
}

export default AuthForm;
