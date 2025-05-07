import React, { useEffect, useState } from 'react';
import { useDataRefresh } from '../context/DataRefreshContext';
import { api } from '../services/api';

interface Tag {
    id: number;
    user_id: number;
    name: string;
    slug: string;
}

interface Bookmark {
    id: number;
    title: string;
    url: string;
    description: string;
    created_at: string;
}

const TagsTab: React.FC = () => {
    const { tagsVersion } = useDataRefresh();
    const [tags, setTags] = useState<Tag[]>([]);
    const [taggedBookmarks, setTaggedBookmarks] = useState<Record<number, Bookmark[]>>({});

    useEffect(() => {
        fetchTags();
    }, [tagsVersion]);

    const fetchTags = async () => {
        try {
            const data = await api.tags.getAll();
            setTags(data);

            const bookmarksMap: Record<number, Bookmark[]> = {};
            for (const tag of data) {
                const bookmarks = await api.tags.getBookmarks(tag.id);
                bookmarksMap[tag.id] = bookmarks;
            }
            setTaggedBookmarks(bookmarksMap);
        } catch (error) {
            console.error('Error fetching tags or bookmarks:', error);
        }
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

    return (
        <div className="dashboard-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {tags.map((tag) => (
                <div key={tag.id} className="tag-section" style={{
                    marginTop: '12px',
                    width: '100%'
                }}>
                    <h2 className="tag-header">{tag.name}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(taggedBookmarks[tag.id] || []).map((bookmark) => (
                            <div key={bookmark.id} className="bookmark-card">
                                <div className="bookmark-content">
                                    <div className="bookmark-header">
                                        <div className="bookmark-title">
                                            <div className="favicon">
                                                <img src={`https://www.google.com/s2/favicons?domain=${bookmark.url}`} alt="" />
                                            </div>
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
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                </div>
            ))}
        </div>
    );
};

export default TagsTab;
