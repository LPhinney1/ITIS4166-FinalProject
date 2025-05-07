import { useState, useEffect, createContext } from 'react';
import { useUser } from '../context/UseUser';
import BookmarksTab from '../tabs/BookmarksTab';
import CollectionsTab from '../tabs/CollectionsTab';
import TagsTab from '../tabs/TagsTab'
import SettingsTab from '../tabs/SettingsTab'
import { api } from '../services/api';
import { useDataRefresh } from '../context/DataRefreshContext';
import '../styles/Dashboard.css';

// Create a context to share the selected collection ID
export const SelectedCollectionContext = createContext<number | null>(null);

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

interface Tag {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

const Dashboard = () => {
    const { logout, token } = useUser();
    const { bookmarksVersion, collectionsVersion, refreshBookmarks, refreshCollections } = useDataRefresh();

    // UI state
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarActive, setSidebarActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // User data state
    const [username, setUsername] = useState('User');
    const [recentBookmarks, setRecentBookmarks] = useState<Bookmark[]>([]);
    const [userCollections, setUserCollections] = useState<Collection[]>([]);
    const [allCollections, setAllCollections] = useState<Collection[]>([]);

    // Modal state
    const [showEditBookmarkModal, setShowEditBookmarkModal] = useState(false);
    const [showEditCollectionModal, setShowEditCollectionModal] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);

    // Selected item state
    const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
    const [selectedBookmarkId, setSelectedBookmarkId] = useState<number | null>(null);
    const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
    const [editTags, setEditTags] = useState('');

    // Extract username from token
    useEffect(() => {
        if (token) {
            try {
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

            // Fetch all collections for modals and data
            const collectionsData = await api.collections.getAll();
            setAllCollections(collectionsData);

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

    // ==================
    // Navigation handlers
    // ==================

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

    const handleViewCollection = (collectionId: number) => {
        setSelectedCollectionId(collectionId);
        setActiveTab('collections');
    };

    // ==================
    // Bookmark handlers
    // ==================

    const handleEditBookmark = async (bookmark: Bookmark) => {
        setEditingBookmark(bookmark);

        // Fetch tags for this bookmark
        try {
            const tags = await api.bookmarks.getTags(bookmark.id);
            const tagNames = tags.map((tag: Tag) => tag.name).join(', ');
            setEditTags(tagNames);
        } catch (err) {
            console.error('Error fetching tags:', err);
            setEditTags('');
        }

        setShowEditBookmarkModal(true);
    };

    const handleDeleteBookmark = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this bookmark?')) {
            try {
                await api.bookmarks.delete(id);
                // Update the local state
                setRecentBookmarks(recentBookmarks.filter((bookmark) => bookmark.id !== id));
                // Refresh data globally
                refreshBookmarks();
                fetchUserData();
            } catch (err) {
                console.error('Error deleting bookmark:', err);
                setError('Failed to delete bookmark');
            }
        }
    };

    const updateBookmark = async () => {
        if (!editingBookmark) return;

        try {
            const updated = await api.bookmarks.update(editingBookmark.id, {
                title: editingBookmark.title,
                url: editingBookmark.url,
                description: editingBookmark.description,
            });

            // Process tags if needed
            if (editTags.trim()) {
                const currentTags = await api.bookmarks.getTags(editingBookmark.id);
                const newTagNames = editTags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter((tag) => tag);

                // Remove tags that are no longer associated
                for (const tag of currentTags) {
                    if (!newTagNames.some((name) => name.toLowerCase() === tag.name.toLowerCase())) {
                        await api.bookmarks.removeTag(editingBookmark.id, tag.id);
                    }
                }

                // Add new tags
                const allTags = await api.tags.getAll();
                for (const tagName of newTagNames) {
                    if (!currentTags.some((t: Tag) => t.name.toLowerCase() === tagName.toLowerCase())) {
                        // Create or find the tag
                        const slug = tagName.toLowerCase().replace(/\s+/g, '-');
                        const existingTag = allTags.find((t: Tag) => t.name.toLowerCase() === tagName.toLowerCase() || t.slug === slug);

                        let tagId: number;
                        if (existingTag) {
                            tagId = existingTag.id;
                        } else {
                            const newTag = await api.tags.create({
                                name: tagName,
                                slug: slug,
                            });
                            tagId = newTag.id;
                        }

                        await api.bookmarks.addTag(editingBookmark.id, tagId);
                    }
                }
            }

            // Update local state
            setRecentBookmarks((prev) => prev.map((bookmark) => (bookmark.id === editingBookmark.id ? updated : bookmark)));

            // Close modal and reset state
            setShowEditBookmarkModal(false);
            setEditingBookmark(null);
            setEditTags('');

            // Refresh data
            refreshBookmarks();
            fetchUserData();
        } catch (err) {
            console.error('Error updating bookmark:', err);
            setError('Failed to update bookmark');
        }
    };

    const handleAddToCollection = (bookmarkId: number) => {
        setSelectedBookmarkId(bookmarkId);
        setSelectedCollectionId(null);
        setShowCollectionModal(true);
    };

    const addToCollection = async () => {
        if (!selectedBookmarkId || !selectedCollectionId) {
            setError('Please select a collection');
            return;
        }

        try {
            // Check if bookmark is already in the collection
            const collectionBookmarks = await api.collections.getBookmarks(selectedCollectionId);
            const isAlreadyAdded = collectionBookmarks.some((bookmark: Bookmark) => bookmark.id === selectedBookmarkId);

            if (isAlreadyAdded) {
                setError('This bookmark is already in this collection');
                return;
            }

            await api.collections.addBookmark(selectedCollectionId, selectedBookmarkId);

            // Close modal and reset state
            setShowCollectionModal(false);
            setSelectedBookmarkId(null);
            setSelectedCollectionId(null);

            // Refresh data
            refreshCollections();
            fetchUserData();
        } catch (err) {
            console.error('Error adding to collection:', err);
            setError('Failed to add to collection');
        }
    };

    // ==================
    // Collection handlers
    // ==================

    const handleEditCollection = (collection: Collection) => {
        setEditingCollection(collection);
        setShowEditCollectionModal(true);
    };

    const handleDeleteCollection = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this collection?')) {
            try {
                await api.collections.delete(id);
                // Update the local state
                setUserCollections(userCollections.filter((collection) => collection.id !== id));
                // Refresh data globally
                refreshCollections();
                fetchUserData();
            } catch (err) {
                console.error('Error deleting collection:', err);
                setError('Failed to delete collection');
            }
        }
    };

    const updateCollection = async () => {
        if (!editingCollection) return;

        try {
            const updated = await api.collections.update(editingCollection.id, {
                name: editingCollection.name,
                description: editingCollection.description,
            });

            // Add the bookmark count from the original object
            const updatedWithCount = {
                ...updated,
                bookmarkCount: editingCollection.bookmarkCount,
            };

            // Update local state
            setUserCollections((prev) => prev.map((collection) => (collection.id === editingCollection.id ? updatedWithCount : collection)));

            // Close modal and reset state
            setShowEditCollectionModal(false);
            setEditingCollection(null);

            // Refresh data
            refreshCollections();
            fetchUserData();
        } catch (err) {
            console.error('Error updating collection:', err);
            setError('Failed to update collection');
        }
    };

    // ==================
    // Form input handlers
    // ==================

    const handleEditBookmarkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;

        if (id === 'edit-bookmark-tags') {
            setEditTags(value);
        } else if (editingBookmark) {
            setEditingBookmark({
                ...editingBookmark,
                [id.replace('edit-bookmark-', '')]: value,
            });
        }
    };

    const handleEditCollectionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;

        if (editingCollection) {
            setEditingCollection({
                ...editingCollection,
                [id.replace('edit-collection-', '')]: value,
            });
        }
    };

    const handleCollectionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCollectionId(Number(e.target.value));
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
                        {activeTab === 'settings' && 'Settings'}
                    </h1>
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
                                {/* Bookmarks Section */}
                                <div className="content-section">
                                    <div className="section-header">
                                        <h2 className="section-title">Recent Bookmarks</h2>
                                        <button className="section-add-button" onClick={() => handleTabClick('bookmarks')} title="Add New Bookmark">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round">
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                        </button>
                                    </div>

                                    {loading ? (
                                        <div className="loading">Loading bookmarks...</div>
                                    ) : recentBookmarks.length > 0 ? (
                                        <>
                                            <div className="dashboard-grid">
                                                {recentBookmarks.map((bookmark) => (
                                                    <div className="bookmark-card" key={bookmark.id}>
                                                        <div className="bookmark-thumbnail">
                                                            <img src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=128`} alt={bookmark.title} />
                                                        </div>
                                                        <div className="bookmark-content">
                                                            <div className="bookmark-header">
                                                                <div className="bookmark-title">
                                                                    <h3>
                                                                        <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                                                                            {bookmark.title}
                                                                        </a>
                                                                    </h3>
                                                                </div>
                                                                <div className="bookmark-actions">
                                                                    <button
                                                                        className="action-btn add-to-collection"
                                                                        title="Add to Collection"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAddToCollection(bookmark.id);
                                                                        }}>
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round">
                                                                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                                                            <line x1="12" y1="11" x2="12" y2="17"></line>
                                                                            <line x1="9" y1="14" x2="15" y2="14"></line>
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        className="action-btn edit"
                                                                        title="Edit Bookmark"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditBookmark(bookmark);
                                                                        }}>
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round">
                                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        className="action-btn delete"
                                                                        title="Delete Bookmark"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteBookmark(bookmark.id);
                                                                        }}>
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round">
                                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                        </svg>
                                                                    </button>
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
                                            </div>

                                            {/* View All Bookmarks button */}
                                            <div className="view-all-container">
                                                <button className="view-all-button" onClick={() => handleTabClick('bookmarks')}>
                                                    <span>View All Bookmarks</span>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round">
                                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                                        <polyline points="12 5 19 12 12 19"></polyline>
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
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

                                {/* Collections Section */}
                                <div className="content-section">
                                    <div className="section-header">
                                        <h2 className="section-title">Your Collections</h2>
                                        <button className="section-add-button" onClick={() => handleTabClick('collections')} title="Add New Collection">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round">
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                        </button>
                                    </div>

                                    {loading ? (
                                        <div className="loading">Loading collections...</div>
                                    ) : userCollections.length > 0 ? (
                                        <>
                                            <div className="dashboard-grid">
                                                {userCollections.map((collection) => (
                                                    <div
                                                        className="collection-card"
                                                        key={collection.id}
                                                        onClick={() => handleViewCollection(collection.id)}
                                                        style={{ cursor: 'pointer' }}>
                                                        <div className="collection-header">
                                                            <h3 className="collection-title">{collection.name}</h3>
                                                            <div className="collection-actions">
                                                                <button
                                                                    className="action-btn edit"
                                                                    title="Edit Collection"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditCollection(collection);
                                                                    }}>
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round">
                                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    className="action-btn delete"
                                                                    title="Delete Collection"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteCollection(collection.id);
                                                                    }}>
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round">
                                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                    </svg>
                                                                </button>
                                                            </div>
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
                                            </div>

                                            {/* View All Collections button */}
                                            <div className="view-all-container">
                                                <button className="view-all-button" onClick={() => handleTabClick('collections')}>
                                                    <span>View All Collections</span>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round">
                                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                                        <polyline points="12 5 19 12 12 19"></polyline>
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
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

            {/* === MODALS === */}

            {/* Edit Bookmark Modal */}
            {showEditBookmarkModal && editingBookmark && (
                <div className="modal-backdrop active">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Bookmark</h2>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowEditBookmarkModal(false);
                                    setEditingBookmark(null);
                                    setEditTags('');
                                }}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    updateBookmark();
                                }}>
                                <div className="form-group">
                                    <label htmlFor="edit-bookmark-url" className="form-label">
                                        URL
                                    </label>
                                    <input type="url" id="edit-bookmark-url" className="form-control" value={editingBookmark.url} onChange={handleEditBookmarkChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-bookmark-title" className="form-label">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        id="edit-bookmark-title"
                                        className="form-control"
                                        value={editingBookmark.title}
                                        onChange={handleEditBookmarkChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-bookmark-description" className="form-label">
                                        Description
                                    </label>
                                    <textarea
                                        id="edit-bookmark-description"
                                        className="form-control"
                                        value={editingBookmark.description}
                                        onChange={handleEditBookmarkChange}></textarea>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-bookmark-tags" className="form-label">
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        id="edit-bookmark-tags"
                                        className="form-control"
                                        placeholder="Enter tags separated by commas"
                                        value={editTags}
                                        onChange={handleEditBookmarkChange}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setShowEditBookmarkModal(false);
                                    setEditingBookmark(null);
                                    setEditTags('');
                                }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={updateBookmark}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Collection Modal */}
            {showEditCollectionModal && editingCollection && (
                <div className="modal-backdrop active">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Collection</h2>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowEditCollectionModal(false);
                                    setEditingCollection(null);
                                }}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    updateCollection();
                                }}>
                                <div className="form-group">
                                    <label htmlFor="edit-collection-name" className="form-label">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="edit-collection-name"
                                        className="form-control"
                                        value={editingCollection.name}
                                        onChange={handleEditCollectionChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-collection-description" className="form-label">
                                        Description
                                    </label>
                                    <textarea
                                        id="edit-collection-description"
                                        className="form-control"
                                        value={editingCollection.description}
                                        onChange={handleEditCollectionChange}></textarea>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setShowEditCollectionModal(false);
                                    setEditingCollection(null);
                                }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={updateCollection}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add to Collection Modal */}
            {showCollectionModal && (
                <div className="modal-backdrop active">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Add to Collection</h2>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowCollectionModal(false);
                                    setSelectedBookmarkId(null);
                                    setSelectedCollectionId(null);
                                    setError(null);
                                }}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="error-message">{error}</div>}
                            {allCollections.length > 0 ? (
                                <div className="form-group">
                                    <label htmlFor="collection-select" className="form-label">
                                        Select Collection
                                    </label>
                                    <select id="collection-select" className="form-control" value={selectedCollectionId || ''} onChange={handleCollectionSelect}>
                                        <option value="">-- Select a Collection --</option>
                                        {allCollections.map((collection) => (
                                            <option key={collection.id} value={collection.id}>
                                                {collection.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <p>You don't have any collections yet. Create a collection first.</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setShowCollectionModal(false);
                                    setSelectedBookmarkId(null);
                                    setSelectedCollectionId(null);
                                    setError(null);
                                }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={addToCollection} disabled={!selectedCollectionId || allCollections.length === 0}>
                                Add to Collection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
