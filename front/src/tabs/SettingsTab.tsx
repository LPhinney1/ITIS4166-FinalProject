import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const SettingsTab: React.FC = () => {
    const userId = api.getCurrentUserId();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const allUsers = await api.users.getAll();
                const currentUser = allUsers.find((user: any) => user.id === userId);
                if (currentUser) {
                    setUsername(currentUser.username);
                }
            } catch (err) {
                console.error('Failed to fetch user:', err);
            }
        };

        if (userId) fetchUser();
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (userId === null) {
            setErrorMessage('User ID not found.');
            return;
        }

        try {
            await api.users.update({
                id: userId,
                password: password !== '' ? password : undefined,
            });
            setSuccessMessage('Account updated successfully!');
            setPassword('');
        } catch (err) {
            console.error(err);
            setErrorMessage('Failed to update account.');
        }
    };

    return (
        <div className="dashboard-tab-content">
            <div className="settings-wrapper">
                <div className="settings-container">
                    <h2 className="settings-title">Account Settings</h2>
                    <form className="settings-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" className="form-input" value={username} disabled />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <input
                                type="password"
                                id="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Leave blank to keep current"
                            />
                        </div>
                        <button type="submit" className="form-button">
                            Save Changes
                        </button>
                        {successMessage && <p className="form-success">{successMessage}</p>}
                        {errorMessage && <p className="form-error">{errorMessage}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
