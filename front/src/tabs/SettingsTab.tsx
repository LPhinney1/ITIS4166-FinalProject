import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

// Define a type that explicitly includes the methods we need
interface User {
    id: number;
    username: string;
    // Add any other properties the user object might have
}

const SettingsTab: React.FC = () => {
    const userId = api.getCurrentUserId();
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [theme, setTheme] = useState('light');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Use type assertion to tell TypeScript that getAll exists and returns User[]
                const allUsers = await (api.users as any).getAll();
                const currentUser = allUsers.find((user: User) => user.id === userId);
                if (currentUser) {
                    setUsername(currentUser.username);
                    // Initialize display name with username
                    setDisplayName(currentUser.username);
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
            // Use type assertion for update method
            await (api.users as any).update({
                id: userId,
                password: password !== '' ? password : undefined,
            });

            setSuccessMessage('Account updated successfully!');

            // Log the display name and theme settings that would be saved in a full implementation
            console.log('Profile settings updated (frontend only):', {
                displayName,
                theme,
            });

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
                    <h2 className="settings-title">Profile Settings</h2>

                    {/* Profile Preview */}
                    <div className="profile-preview">
                        <div className="avatar-preview" style={{ backgroundColor: 'var(--primary-color)' }}>
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <form className="settings-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" className="form-input" value={username} disabled />
                            <span className="form-help">Username cannot be changed</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="displayName">Display Name</label>
                            <input
                                type="text"
                                id="displayName"
                                className="form-input"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="How you want to be known"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="theme">Theme Preference</label>
                            <select id="theme" className="form-input" value={theme} onChange={(e) => setTheme(e.target.value)}>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System Default</option>
                            </select>
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
