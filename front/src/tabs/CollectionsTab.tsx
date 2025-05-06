import { useState, useEffect } from 'react';
import { api } from '../services/api';

// Types for our collections
interface Collection {
    id: number;
    user_id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    bookmarkCount?: number;
}

const CollectionsTab = () => {
    // State for collections and loading state
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newCollection, setNewCollection] = useState({
        name: '',
        description: '',
    });
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

    // Fetch collections on component mount
    useEffect(() => {
        fetchCollections();
    }, []);

    // Function to fetch collections from API
    const fetchCollections = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.collections.getAll();

            // For each collection, get its bookmarks to count them
            const collectionsWithCount = await Promise.all(
                data.map(async (collection: Collection) => {
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

            setCollections(collectionsWithCount);
        } catch (err) {
            console.error('Error fetching collections:', err);
            setError('Failed to load collections. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle adding a new collection
    const handleAddCollection = () => {
        setNewCollection({ name: '', description: '' });
        setShowAddModal(true);
    };

    // Function to handle editing a collection
    const handleEditCollection = (collection: Collection) => {
        setEditingCollection(collection);
        setShowEditModal(true);
    };

    // Function to handle input changes in the add form
    const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setNewCollection({
            ...newCollection,
            [id.replace('collection-', '')]: value,
        });
    };

    // Function to handle input changes in the edit form
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        if (editingCollection) {
            setEditingCollection({
                ...editingCollection,
                [id.replace('edit-collection-', '')]: value,
            });
        }
    };

    // Function to create a new collection
    const createCollection = async () => {
        if (!newCollection.name.trim()) {
            setError('Collection name is required');
            return;
        }

        try {
            setError(null);

            const response = await api.collections.create({
                name: newCollection.name,
                description: newCollection.description,
            });

            // Add the new collection to the state with a bookmark count of 0
            setCollections([...collections, { ...response, bookmarkCount: 0 }]);
            setShowAddModal(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Error creating collection:', err);
            setError(`Failed to create collection: ${errorMessage}`);
        }
    };

    // Function to update a collection
    const updateCollection = async () => {
        if (!editingCollection || !editingCollection.name.trim()) {
            setError('Collection name is required');
            return;
        }

        try {
            setError(null);

            const response = await api.collections.update(editingCollection.id, {
                name: editingCollection.name,
                description: editingCollection.description,
            });

            // Update the collection in the state
            setCollections(collections.map((collection) => (collection.id === editingCollection.id ? { ...response, bookmarkCount: collection.bookmarkCount } : collection)));

            setShowEditModal(false);
            setEditingCollection(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Error updating collection:', err);
            setError(`Failed to update collection: ${errorMessage}`);
        }
    };

    // Function to delete a collection
    const deleteCollection = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this collection?')) {
            try {
                setError(null);
                await api.collections.delete(id);
                setCollections(collections.filter((collection) => collection.id !== id));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                console.error('Error deleting collection:', err);
                setError(`Failed to delete collection: ${errorMessage}`);
            }
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (loading && collections.length === 0) {
        return <div className="loading">Loading collections...</div>;
    }

    return (
        <div className="collections-tab">
            {error && <div className="error-message">{error}</div>}

            {collections.length > 0 ? (
                <>
                    <div className="tab-actions">
                        <button className="btn btn-primary add-collection-btn" onClick={handleAddCollection}>
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
                            <span>Add Collection</span>
                        </button>
                    </div>
                    <div className="collections-grid">
                        {collections.map((collection) => (
                            <div className="collection-card" key={collection.id}>
                                <div className="collection-header">
                                    <h3 className="collection-title">{collection.name}</h3>
                                    <div className="collection-actions">
                                        <button className="action-btn edit" onClick={() => handleEditCollection(collection)}>
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
                                        <button className="action-btn delete" onClick={() => deleteCollection(collection.id)}>
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
                </>
            ) : (
                <div className="empty-bookmarks-container" onClick={handleAddCollection}>
                    <div className="big-plus-icon">+</div>
                    <div className="add-bookmark-text">Create Collection</div>
                </div>
            )}

            {/* Add Collection Modal */}
            {showAddModal && (
                <div className="modal-backdrop active">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Create Collection</h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>
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
                                    createCollection();
                                }}>
                                <div className="form-group">
                                    <label htmlFor="collection-name" className="form-label">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="collection-name"
                                        className="form-control"
                                        placeholder="Enter collection name"
                                        value={newCollection.name}
                                        onChange={handleAddInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="collection-description" className="form-label">
                                        Description
                                    </label>
                                    <textarea
                                        id="collection-description"
                                        className="form-control"
                                        placeholder="Enter a description (optional)"
                                        value={newCollection.description}
                                        onChange={handleAddInputChange}></textarea>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={createCollection}>
                                Create Collection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Collection Modal */}
            {showEditModal && editingCollection && (
                <div className="modal-backdrop active">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Collection</h2>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowEditModal(false);
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
                                        placeholder="Enter collection name"
                                        value={editingCollection.name}
                                        onChange={handleEditInputChange}
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
                                        placeholder="Enter a description (optional)"
                                        value={editingCollection.description}
                                        onChange={handleEditInputChange}></textarea>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setShowEditModal(false);
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
        </div>
    );
};

export default CollectionsTab;
