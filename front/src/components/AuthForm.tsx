import React, { useState } from 'react';
import '../styles/LoginPage.css';

type Props = {
    onLogin: (token: string) => void;
};

function AuthForm({ onLogin }: Props) {
    const [activeTab, setActiveTab] = useState('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loginError, setLoginError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState('');

    const baseUrl = import.meta.env.VITE_URL;

    const validateLogin = () => {
        const newErrors: Record<string, string> = {};
        if (!username.trim()) {
            newErrors.username = 'Username is required';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateRegister = () => {
        const newErrors: Record<string, string> = {};
        if (!username.trim()) {
            newErrors.username = 'Username is required';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        if (!validateLogin()) return;

        try {
            const res = await fetch(`${baseUrl}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                setLoginError('Invalid credentials. Please try again.');
                return;
            }

            const data = await res.json();
            onLogin(data.token);
        } catch (err) {
            setLoginError('An error occurred. Please try again.');
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterSuccess('');

        if (!validateRegister()) return;

        try {
            const res = await fetch(`${baseUrl}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email: `${username}@example.com`, password }),
            });

            if (!res.ok) {
                setErrors({ form: 'Registration failed. Please try again.' });
                return;
            }

            setRegisterSuccess('Registration successful! You can now log in.');
            // Reset form
            setUsername('');
            setPassword('');
            setConfirmPassword('');

            // Switch to login tab after 2 seconds
            setTimeout(() => {
                setActiveTab('login');
            }, 2000);
        } catch (err) {
            setErrors({ form: 'An error occurred. Please try again.' });
        }
    };

    return (
        <div className="login-container">
            {/* Logo */}
            <div className="logo-container">
                <div className="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>BookmarkHub</span>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="form-tabs">
                <div className={`form-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>
                    Login
                </div>
                <div className={`form-tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
                    Register
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Login Form */}
                <div className={`tab-panel ${activeTab === 'login' ? 'active' : ''}`}>
                    {loginError && (
                        <div className="alert alert-error">
                            <div className="alert-icon">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <div className="alert-content">{loginError}</div>
                        </div>
                    )}

                    <form onSubmit={handleLoginSubmit}>
                        <div className="form-group">
                            <label htmlFor="login-username" className="form-label">
                                Username
                            </label>
                            <input
                                type="text"
                                id="login-username"
                                className="form-control"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            {errors.username && <div className="form-error active">{errors.username}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="login-password" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="login-password"
                                className="form-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {errors.password && <div className="form-error active">{errors.password}</div>}
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Sign In
                        </button>
                    </form>
                </div>

                {/* Register Form */}
                <div className={`tab-panel ${activeTab === 'register' ? 'active' : ''}`}>
                    {registerSuccess && (
                        <div className="alert alert-success">
                            <div className="alert-icon">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <div className="alert-content">{registerSuccess}</div>
                        </div>
                    )}

                    <form onSubmit={handleRegisterSubmit}>
                        <div className="form-group">
                            <label htmlFor="register-username" className="form-label">
                                Username
                            </label>
                            <input
                                type="text"
                                id="register-username"
                                className="form-control"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            {errors.username && <div className="form-error active">{errors.username}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="register-password" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="register-password"
                                className="form-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {errors.password && <div className="form-error active">{errors.password}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="register-password-confirm" className="form-label">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="register-password-confirm"
                                className="form-control"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            {errors.confirmPassword && <div className="form-error active">{errors.confirmPassword}</div>}
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Create Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AuthForm;
