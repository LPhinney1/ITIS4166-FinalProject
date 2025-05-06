import { useState } from 'react';

// Types for our bookmarks
interface Bookmark {
    id: number;
    title: string;
    url: string;
    description: string;
    favicon: string;
    createdAt: string;
}

const BookmarksTab = () => {
    // State for bookmarks and add bookmark modal
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Function to handle adding a new bookmark
    const handleAddBookmark = () => {
        setShowAddModal(true);
    };

    return (
        <div className="bookmarks-tab">
            {bookmarks.length > 0 ? (
                <>
                    <div className="tab-actions">
                        <button className="btn btn-primary add-bookmark-btn" onClick={handleAddBookmark}>
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
                            Add Bookmark
                        </button>
                    </div>
                    <div className="bookmarks-grid">
                        {bookmarks.map((bookmark) => (
                            <div className="bookmark-card" key={bookmark.id}>
                                <div className="bookmark-thumbnail">
                                    <img src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=128`} alt={bookmark.title} />
                                </div>
                                <div className="bookmark-content">
                                    <div className="bookmark-title">
                                        <div className="favicon">
                                            <img src={`https://www.google.com/s2/favicons?domain=${bookmark.url}`} alt="" />
                                        </div>
                                        <h3>{bookmark.title}</h3>
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
                                            <span>{bookmark.createdAt}</span>
                                        </div>
                                        <div className="bookmark-actions">
                                            <button className="action-btn edit">
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
                                            <button className="action-btn delete">
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
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="empty-bookmarks-container" onClick={handleAddBookmark}>
                    <div className="big-plus-icon">+</div>
                    <div className="add-bookmark-text">Add Bookmark</div>
                </div>
            )}

            {/* Add Bookmark Modal */}
            {showAddModal && (
                <div className="modal-backdrop active">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Add Bookmark</h2>
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
                            <form>
                                <div className="form-group">
                                    <label htmlFor="bookmark-url" className="form-label">
                                        URL
                                    </label>
                                    <input type="url" id="bookmark-url" className="form-control" placeholder="https://example.com" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bookmark-title" className="form-label">
                                        Title
                                    </label>
                                    <input type="text" id="bookmark-title" className="form-control" placeholder="Enter bookmark title" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bookmark-description" className="form-label">
                                        Description
                                    </label>
                                    <textarea id="bookmark-description" className="form-control" placeholder="Enter a description (optional)"></textarea>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bookmark-tags" className="form-label">
                                        Tags
                                    </label>
                                    <input type="text" id="bookmark-tags" className="form-control" placeholder="Enter tags separated by commas" />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary">Save Bookmark</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookmarksTab;
