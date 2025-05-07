import { useState, useEffect } from 'react';
import { useUser } from '../context/UseUser';
import BookmarksTab from '../tabs/BookmarksTab';
import CollectionsTab from '../tabs/CollectionsTab';
import TagsTab from '../tabs/TagsTab';
//import SettingsTab from '../tabs/SettingsTab'
import { api } from '../services/api';
import { useDataRefresh } from '../context/DataRefreshContext';
import '../styles/Dashboard.css';

// Create a context to share the selected collection ID
import React from 'react';
export const SelectedCollectionContext = React.createContext<number | null>(null);

// Types for our data
interface Bookmark {
    id: number;
    user_id: number;
    title: string;
    url: string;
    description: string;
    created_at: string;
    updated_at: string;
}

interface Collection {
    id: number;
    user_id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    bookmarkCount?: number;
}

const Dashboard = () => {
    const { logout, token } = useUser();
    const { bookmarksVersion, collectionsVersion } = useDataRefresh();

    const [sidebarActive, setSidebarActive] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [username, setUsername] = useState('User');
    const [recentBookmarks, setRecentBookmarks] = useState<Bookmark[]>([]);
    const [userCollections, setUserCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    // State to track selected collection ID
    const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);

    // Extract username from token and fetch user data
    useEffect(() => {
        if (token) {
            try {
                // Simple decoding without additional libraries
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) => {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        })
                        .join(''),
                );
                const decoded = JSON.parse(jsonPayload);
                setUsername(decoded.username || 'User');
            } catch (error) {
                console.error('Error decoding token:', error);
                setUsername('User');
            }
        }
    }, [token]);

    // Fetch user data when dashboard is active or when the data changes
    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchUserData();
        }
    }, [activeTab, bookmarksVersion, collectionsVersion]);

    // Fetch user's bookmarks and collections
    const fetchUserData = async () => {
        setLoading(true);
        try {
            // Fetch bookmarks
            const bookmarksData = await api.bookmarks.getAll();
            setRecentBookmarks(bookmarksData.slice(0, 3)); // Get the most recent 3 bookmarks

            // Fetch collections with bookmark counts
            const collectionsData = await api.collections.getAll();

            // For each collection, get its bookmarks to count them
            const collectionsWithCount = await Promise.all(
                collectionsData.map(async (collection: Collection) => {
                    try {
                        const bookmarks = await api.collections.getBookmarks(collection.id);
                        return {
                            ...collection,
                            bookmarkCount: bookmarks.length,
                        };
                    } catch (err) {
                        return {
                            ...collection,
                            bookmarkCount: 0,
                        };
                    }
                }),
            );

            setUserCollections(collectionsWithCount.slice(0, 3)); // Get the most recent 3 collections
        } catch (err) {
            console.error('Error fetching user data:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarActive(!sidebarActive);
    };

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);

        // Reset selected collection when switching tabs (unless we're navigating to collections from dashboard)
        if (tabId !== 'collections') {
            setSelectedCollectionId(null);
        }

        // Refresh data when switching tabs
        if (tabId === 'dashboard') {
            fetchUserData();
        }
    };

    // Handle navigating to a specific collection
    const handleViewCollection = (collectionId: number) => {
        setSelectedCollectionId(collectionId);
        setActiveTab('collections');
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Get first letter of username for avatar
    const avatarText = username ? username.charAt(0).toUpperCase() : 'U';

    return (
        <div className="app-container">
            {/* Sidebar */}
            <div className={`sidebar ${sidebarActive ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo" onClick={() => handleTabClick('dashboard')} style={{ cursor: 'pointer' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>BookmarkHub</span>
                    </div>
                </div>
                <div className="sidebar-nav">
                    <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabClick('dashboard')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>Dashboard</span>
                    </a>
                    <a href="#" className={`nav-item ${activeTab === 'bookmarks' ? 'active' : ''}`} onClick={() => handleTabClick('bookmarks')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>My Bookmarks</span>
                    </a>
                    <a href="#" className={`nav-item ${activeTab === 'collections' ? 'active' : ''}`} onClick={() => handleTabClick('collections')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M3 12h18"></path>
                            <path d="M3 18h18"></path>
                        </svg>
                        <span>Collections</span>
                    </a>
                    <a href="#" className={`nav-item ${activeTab === 'tags' ? 'active' : ''}`} onClick={() => handleTabClick('tags')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                            <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                        <span>Tags</span>
                    </a>
                    <a href="#" className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleTabClick('settings')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        <span>Settings</span>
                    </a>
                </div>
                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="avatar">{avatarText}</div>
                        <div className="user-info">
                            <div className="user-name">{username}</div>
                            <div className="user-email">Logged In</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="content-header">
                    <h1 className="content-title">
                        {activeTab === 'dashboard' && 'Dashboard'}
                        {activeTab === 'bookmarks' && 'My Bookmarks'}
                        {activeTab === 'collections' && 'Collections'}
                        {activeTab === 'tags' && 'Tags'}
                    </h1>
                    <div className="search-bar">
                        <svg
                            className="search-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" className="search-input" placeholder="Search bookmarks..." />
                    </div>
                    <button className="btn btn-outline" onClick={logout}>
                        Logout
                    </button>
                </div>

                <SelectedCollectionContext.Provider value={selectedCollectionId}>
                    {/* Tab Content */}
                    <div className="tab-content">
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <>
                                <div className="content-section">
                                    <div className="section-header">
                                        <h2 className="section-title">Recent Bookmarks</h2>
                                        <button className="section-action" onClick={() => handleTabClick('bookmarks')}>
                                            View All
                                        </button>
                                    </div>

                                    {loading ? (
                                        <div className="loading">Loading bookmarks...</div>
                                    ) : recentBookmarks.length > 0 ? (
                                        <div className="dashboard-grid">
                                            {recentBookmarks.map((bookmark) => (
                                                <div className="bookmark-card" key={bookmark.id}>
                                                    <div className="bookmark-thumbnail">
                                                        <img src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=128`} alt={bookmark.title} />
                                                    </div>
                                                    <div className="bookmark-content">
                                                        <div className="bookmark-header">
                                                            <div className="bookmark-title">
                                                                {/* Favicon removed here */}
                                                                <h3>
                                                                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                                                                        {bookmark.title}
                                                                    </a>
                                                                </h3>
                                                            </div>
                                                        </div>
                                                        <p className="bookmark-description">{bookmark.description}</p>
                                                        <div className="bookmark-meta">
                                                            <div className="bookmark-date">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round">
                                                                    <circle cx="12" cy="12" r="10"></circle>
                                                                    <polyline points="12 6 12 12 16 14"></polyline>
                                                                </svg>
                                                                <span>{formatDate(bookmark.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="add-card" onClick={() => handleTabClick('bookmarks')}>
                                                <div className="add-card-content">
                                                    <div className="add-icon">+</div>
                                                    <p>Add more bookmarks</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="empty-state">
                                            <svg
                                                className="empty-state-icon"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round">
                                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                            <h3 className="empty-state-title">No bookmarks yet</h3>
                                            <p className="empty-state-description">Start adding bookmarks to organize your favorite websites.</p>
                                            <button className="btn btn-primary" onClick={() => handleTabClick('bookmarks')}>
                                                Add Your First Bookmark
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="content-section">
                                    <div className="section-header">
                                        <h2 className="section-title">Your Collections</h2>
                                        <button className="section-action" onClick={() => handleTabClick('collections')}>
                                            View All
                                        </button>
                                    </div>

                                    {loading ? (
                                        <div className="loading">Loading collections...</div>
                                    ) : userCollections.length > 0 ? (
                                        <div className="dashboard-grid">
                                            {userCollections.map((collection) => (
                                                <div
                                                    className="collection-card"
                                                    key={collection.id}
                                                    onClick={() => handleViewCollection(collection.id)}
                                                    style={{ cursor: 'pointer' }}>
                                                    <div className="collection-header">
                                                        <h3 className="collection-title">{collection.name}</h3>
                                                    </div>
                                                    <p className="collection-description">{collection.description}</p>
                                                    <div className="collection-meta">
                                                        <div className="bookmark-count">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round">
                                                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                                            </svg>
                                                            <span>{collection.bookmarkCount || 0} bookmarks</span>
                                                        </div>
                                                        <div className="collection-date">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round">
                                                                <circle cx="12" cy="12" r="10"></circle>
                                                                <polyline points="12 6 12 12 16 14"></polyline>
                                                            </svg>
                                                            <span>{formatDate(collection.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="add-card" onClick={() => handleTabClick('collections')}>
                                                <div className="add-card-content">
                                                    <div className="add-icon">+</div>
                                                    <p>Add more collections</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="empty-state">
                                            <svg
                                                className="empty-state-icon"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round">
                                                <path d="M3 6h18"></path>
                                                <path d="M3 12h18"></path>
                                                <path d="M3 18h18"></path>
                                            </svg>
                                            <h3 className="empty-state-title">No collections yet</h3>
                                            <p className="empty-state-description">Create collections to organize your bookmarks by topic or category.</p>
                                            <button className="btn btn-primary" onClick={() => handleTabClick('collections')}>
                                                Create Your First Collection
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* My Bookmarks Tab */}
                        {activeTab === 'bookmarks' && <BookmarksTab />}

                        {/* Collections Tab */}
                        {activeTab === 'collections' && <CollectionsTab />}

                        {/* Tags Tab */}
                        {activeTab === 'tags' && <TagsTab />}
                    </div>
                </SelectedCollectionContext.Provider>
            </div>

            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
        </div>
    );
};

export default Dashboard;
