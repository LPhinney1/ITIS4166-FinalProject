import { useState } from 'react';
import { useUser } from '../context/UseUser';
import BookmarksTab from '../tabs/BookmarksTab';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { logout } = useUser();
    const [sidebarActive, setSidebarActive] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    const toggleSidebar = () => {
        setSidebarActive(!sidebarActive);
    };

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <div className={`sidebar ${sidebarActive ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
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
                </div>
                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="avatar">JS</div>
                        <div className="user-info">
                            <div className="user-name">John Smith</div>
                            <div className="user-email">john@example.com</div>
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

                {/* Tab Content */}
                <div className="tab-content">
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="content-section">
                                <h2 className="section-title">Recent Bookmarks</h2>
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
                                    <button className="btn btn-primary">Add Your First Bookmark</button>
                                </div>
                            </div>

                            <div className="content-section">
                                <h2 className="section-title">Your Collections</h2>
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
                                    <button className="btn btn-primary">Create Your First Collection</button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* My Bookmarks Tab */}
                    {activeTab === 'bookmarks' && <BookmarksTab />}

                    {/* Collections Tab */}
                    {activeTab === 'collections' && (
                        <div className="collections-tab">
                            <div className="empty-bookmarks-container">
                                <div className="big-plus-icon">+</div>
                                <div className="add-bookmark-text">Create Collection</div>
                            </div>
                        </div>
                    )}

                    {/* Tags Tab */}
                    {activeTab === 'tags' && (
                        <div className="tags-tab">
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
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                </svg>
                                <h3 className="empty-state-title">No tags yet</h3>
                                <p className="empty-state-description">Tags will appear when you add them to your bookmarks.</p>
                            </div>
                        </div>
                    )}
                </div>
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
