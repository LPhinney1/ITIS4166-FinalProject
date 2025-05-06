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
    const [bookmarks] = useState<Bookmark[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [error, setError] = useState('');

    const userId = 1; // replace with actual user ID later
    const token = localStorage.getItem('authorization');

    const handleAddBookmark = () => setShowAddModal(true);

    const handleSaveBookmark = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/bookmarks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token || '',
                },
                body: JSON.stringify({ title, url, description, user_id: userId }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err?.error || 'Failed to save bookmark');
            }

            setShowAddModal(false);
            setTitle('');
            setUrl('');
            setDescription('');
            setTags('');
            setError('');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="bookmarks-tab">
            {bookmarks.length > 0 ? (
                <>
                    <div className="tab-actions">
                        <button className="btn btn-primary add-bookmark-btn" onClick={handleAddBookmark}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                            <span>{bookmark.createdAt}</span>
                                        </div>
                                        <div className="bookmark-actions">
                                            <button className="action-btn edit">{/* edit icon */}</button>
                                            <button className="action-btn delete">{/* delete icon */}</button>
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

            {showAddModal && (
                <div className="modal-backdrop active">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Add Bookmark</h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="form-group">
                                    <label>URL</label>
                                    <input type="url" required className="form-control" value={url} onChange={(e) => setUrl(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input type="text" required className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Tags</label>
                                    <input type="text" className="form-control" value={tags} onChange={(e) => setTags(e.target.value)} />
                                </div>
                                {error && <p className="text-red-500">{error}</p>}
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="btn btn-primary" type="button" onClick={handleSaveBookmark}>Save Bookmark</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookmarksTab;
