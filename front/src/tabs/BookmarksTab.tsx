import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useDataRefresh } from '../context/DataRefreshContext';

// Types for our bookmarks
interface Bookmark {
    id: number;
    user_id: number;
    title: string;
    url: string;
    description: string;
    created_at: string;
    updated_at: string;
}

// Types for tags
interface Tag {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

// Types for collections
interface Collection {
    id: number;
    user_id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

const BookmarksTab = () => {
    // Access the refresh context
    const { bookmarksVersion, refreshBookmarks, refreshCollections } = useDataRefresh();

    // State for bookmarks and loading state
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [selectedBookmarkId, setSelectedBookmarkId] = useState<number | null>(null);
    const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
    const [newBookmark, setNewBookmark] = useState({
        title: '',
        url: '',
        description: '',
        tags: '',
    });
    const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
    const [editTags, setEditTags] = useState('');

    // Fetch bookmarks and collections when component mounts or when bookmarksVersion changes
    useEffect(() => {
        fetchBookmarks();
        fetchCollections();
    }, [bookmarksVersion]);

    // Function to fetch bookmarks from API
    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.bookmarks.getAll();
            setBookmarks(data);
        } catch (err) {
            console.error('Error fetching bookmarks:', err);
            setError('Failed to load bookmarks. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch collections
    const fetchCollections = async () => {
        try {
            const data = await api.collections.getAll();
            setCollections(data);
        } catch (err) {
            console.error('Error fetching collections:', err);
        }
    };

    // Function to handle adding a new bookmark
    const handleAddBookmark = () => {
        setNewBookmark({ title: '', url: '', description: '', tags: '' });
        setShowAddModal(true);
    };

    // Function to handle editing a bookmark
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

        setShowEditModal(true);
    };

    // Function to open add to collection modal
    const handleAddToCollection = (bookmarkId: number) => {
        setSelectedBookmarkId(bookmarkId);
        setSelectedCollectionId(null);
        setShowCollectionModal(true);
    };

    // Function to add bookmark to collection
    const addToCollection = async () => {
        if (!selectedBookmarkId || !selectedCollectionId) {
            setError('Please select a collection');
            return;
        }

        try {
            setError(null);

            // Check if bookmark is already in the collection
            const collectionBookmarks = await api.collections.getBookmarks(selectedCollectionId);
            const isAlreadyAdded = collectionBookmarks.some((bookmark: Bookmark) => bookmark.id === selectedBookmarkId);

            if (isAlreadyAdded) {
                setNotification('This bookmark is already added to this collection');
                setTimeout(() => setNotification(null), 3000);
                return;
            }

            await api.collections.addBookmark(selectedCollectionId, selectedBookmarkId);
            setShowCollectionModal(false);

            // Refresh collections to update bookmark count
            refreshCollections();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Error adding bookmark to collection:', err);

            // Check if it's likely a duplicate bookmark error
            if (errorMessage.includes('API Error: 400')) {
                setNotification('This bookmark is already added to this collection');
                setTimeout(() => setNotification(null), 5000);
            } else {
                setError(`Failed to add to collection: ${errorMessage}`);
            }
        }
    };

    // Function to handle input changes in the add form
    const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setNewBookmark({
            ...newBookmark,
            [id.replace('bookmark-', '')]: value,
        });
    };

    // Function to handle input changes in the edit form
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // Function to handle collection selection
    const handleCollectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCollectionId(Number(e.target.value));
    };

    // Function to create a new bookmark
    const createBookmark = async () => {
        if (!newBookmark.title.trim() || !newBookmark.url.trim()) {
            setError('Title and URL are required');
            return;
        }

        try {
            setError(null);

            const response = await api.bookmarks.create({
                title: newBookmark.title,
                url: newBookmark.url,
                description: newBookmark.description,
            });

            // If tags were provided, process them
            if (newBookmark.tags) {
                const tagNames = newBookmark.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter((tag) => tag);

                for (const tagName of tagNames) {
                    try {
                        // Create tag or find existing tag
                        const slug = tagName.toLowerCase().replace(/\s+/g, '-');

                        // Try to find existing tags
                        const tags = await api.tags.getAll();
                        let tagId: number | null = null;

                        const existingTag = tags.find((tag: Tag) => tag.name.toLowerCase() === tagName.toLowerCase() || tag.slug === slug);

                        if (existingTag) {
                            tagId = existingTag.id;
                        } else {
                            // Create new tag
                            const newTag = await api.tags.create({
                                name: tagName,
                                slug: slug,
                            });
                            tagId = newTag.id;
                        }

                        // Add tag to bookmark
                        if (tagId) {
                            await api.bookmarks.addTag(response.id, tagId);
                        }
                    } catch (tagErr) {
                        console.error(`Error processing tag "${tagName}":`, tagErr);
                        // Continue with other tags even if one fails
                    }
                }
            }

            // Update local state
            setBookmarks([...bookmarks, response]);
            setShowAddModal(false);

            // Refresh data globally
            refreshBookmarks();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Error creating bookmark:', err);
            setError(`Failed to create bookmark: ${errorMessage}`);
        }
    };

    // Function to update a bookmark
    const updateBookmark = async () => {
        if (!editingBookmark || !editingBookmark.title.trim() || !editingBookmark.url.trim()) {
            setError('Title and URL are required');
            return;
        }

        try {
            setError(null);

            // Update bookmark details
            const response = await api.bookmarks.update(editingBookmark.id, {
                title: editingBookmark.title,
                url: editingBookmark.url,
                description: editingBookmark.description,
            });

            // Handle tags update - first fetch current tags
            const currentTags = await api.bookmarks.getTags(editingBookmark.id);
            const newTagNames = editTags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag);

            // Get all available tags
            const allTags = await api.tags.getAll();

            // Remove tags that are no longer associated
            for (const tag of currentTags) {
                const tagName = tag.name.toLowerCase();
                if (!newTagNames.some((name) => name.toLowerCase() === tagName)) {
                    await api.bookmarks.removeTag(editingBookmark.id, tag.id);
                }
            }

            // Add new tags
            for (const tagName of newTagNames) {
                const tagNameLower = tagName.toLowerCase();
                const existingTag = currentTags.find((t: Tag) => t.name.toLowerCase() === tagNameLower);

                if (!existingTag) {
                    // Check if tag exists in system
                    const slug = tagNameLower.replace(/\s+/g, '-');
                    let tagId: number | null = null;

                    const systemTag = allTags.find((t: Tag) => t.name.toLowerCase() === tagNameLower || t.slug === slug);

                    if (systemTag) {
                        tagId = systemTag.id;
                    } else {
                        // Create new tag
                        const newTag = await api.tags.create({
                            name: tagName,
                            slug: slug,
                        });
                        tagId = newTag.id;
                    }

                    // Add tag to bookmark
                    if (tagId) {
                        await api.bookmarks.addTag(editingBookmark.id, tagId);
                    }
                }
            }

            // Update the bookmark in the state
            setBookmarks(bookmarks.map((bookmark) => (bookmark.id === editingBookmark.id ? response : bookmark)));

            setShowEditModal(false);
            setEditingBookmark(null);
            setEditTags('');

            // Refresh data globally
            refreshBookmarks();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Error updating bookmark:', err);
            setError(`Failed to update bookmark: ${errorMessage}`);
        }
    };

    // Function to delete a bookmark
    const deleteBookmark = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this bookmark?')) {
            try {
                setError(null);
                await api.bookmarks.delete(id);
                setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));

                // Refresh data globally
                refreshBookmarks();
                // Also refresh collections as bookmark counts may change
                refreshCollections();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                console.error('Error deleting bookmark:', err);
                setError(`Failed to delete bookmark: ${errorMessage}`);
            }
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (loading && bookmarks.length === 0) {
        return <div className="loading">Loading bookmarks...</div>;
    }

    return (
        <div className="bookmarks-tab">
            {error && <div className="error-message">{error}</div>}
            {notification && (
                <div
                    className="notification-message"
                    style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        padding: '12px 20px',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        animation: 'fadeIn 0.3s ease-out',
                    }}>
                    {notification}
                </div>
            )}

            {/* Always show the Add Bookmark button at the top */}
            <div className="add-button-container">
                <button className="add-button" onClick={handleAddBookmark}>
                    <span className="plus-icon">+</span> Add Bookmark
                </button>
            </div>

            {bookmarks.length > 0 ? (
                <div className="bookmarks-grid">
                    {bookmarks.map((bookmark) => (
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
                                        <button className="action-btn add-to-collection" title="Add to Collection" onClick={() => handleAddToCollection(bookmark.id)}>
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
                                        <button className="action-btn edit" title="Edit Bookmark" onClick={() => handleEditBookmark(bookmark)}>
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
                                        <button className="action-btn delete" title="Delete Bookmark" onClick={() => deleteBookmark(bookmark.id)}>
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
                </div>
            )}

            {showAddModal && (
                <div className="modal-backdrop active">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Add Bookmark</h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    createBookmark();
                                }}>
                                <div className="form-group">
                                    <label htmlFor="bookmark-url" className="form-label">
                                        URL
                                    </label>
                                    <input
                                        type="url"
                                        id="bookmark-url"
                                        className="form-control"
                                        placeholder="https://example.com"
                                        value={newBookmark.url}
                                        onChange={handleAddInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bookmark-title" className="form-label">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        id="bookmark-title"
                                        className="form-control"
                                        placeholder="Enter bookmark title"
                                        value={newBookmark.title}
                                        onChange={handleAddInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bookmark-description" className="form-label">
                                        Description
                                    </label>
                                    <textarea
                                        id="bookmark-description"
                                        className="form-control"
                                        placeholder="Enter a description (optional)"
                                        value={newBookmark.description}
                                        onChange={handleAddInputChange}></textarea>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bookmark-tags" className="form-label">
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        id="bookmark-tags"
                                        className="form-control"
                                        placeholder="Enter tags separated by commas"
                                        value={newBookmark.tags}
                                        onChange={handleAddInputChange}
                                    />
                                </div>
                                {error && <p className="text-red-500">{error}</p>}
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={createBookmark}>
                                Save Bookmark
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Bookmark Modal */}
            {showEditModal && editingBookmark && (
                <div className="modal-backdrop active">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Bookmark</h2>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowEditModal(false);
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
                                    <input
                                        type="url"
                                        id="edit-bookmark-url"
                                        className="form-control"
                                        placeholder="https://example.com"
                                        value={editingBookmark.url}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-bookmark-title" className="form-label">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        id="edit-bookmark-title"
                                        className="form-control"
                                        placeholder="Enter bookmark title"
                                        value={editingBookmark.title}
                                        onChange={handleEditInputChange}
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
                                        placeholder="Enter a description (optional)"
                                        value={editingBookmark.description}
                                        onChange={handleEditInputChange}></textarea>
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
                                        onChange={handleEditInputChange}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setShowEditModal(false);
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
                            {collections.length > 0 ? (
                                <div className="form-group">
                                    <label htmlFor="collection-select" className="form-label">
                                        Select Collection
                                    </label>
                                    <select id="collection-select" className="form-control" value={selectedCollectionId || ''} onChange={handleCollectionChange}>
                                        <option value="">-- Select a Collection --</option>
                                        {collections.map((collection) => (
                                            <option key={collection.id} value={collection.id}>
                                                {collection.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <p className="no-collections-message">You don't have any collections yet. Create a collection first.</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setShowCollectionModal(false);
                                    setSelectedBookmarkId(null);
                                }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={addToCollection} disabled={!selectedCollectionId || collections.length === 0}>
                                Add to Collection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookmarksTab;
