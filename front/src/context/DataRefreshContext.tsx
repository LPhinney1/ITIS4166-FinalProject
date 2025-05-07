import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the context shape
interface DataRefreshContextType {
    bookmarksVersion: number;
    collectionsVersion: number;
    tagsVersion: Number;
    refreshBookmarks: () => void;
    refreshCollections: () => void;
    refreshTags: () => void;
    refreshAll: () => void;
}

// Create the context with default values
const DataRefreshContext = createContext<DataRefreshContextType>({
    bookmarksVersion: 0,
    collectionsVersion: 0,
    tagsVersion: 0,
    refreshBookmarks: () => {},
    refreshCollections: () => {},
    refreshTags: () => {},
    refreshAll: () => {},
});

// Custom hook to use the refresh context
export const useDataRefresh = () => useContext(DataRefreshContext);

// Context provider component
export const DataRefreshProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [bookmarksVersion, setBookmarksVersion] = useState(0);
    const [collectionsVersion, setCollectionsVersion] = useState(0);
    const [tagsVersion, setTagsVersion] = useState(0);

    // Increment the version to trigger rerenders
    const refreshBookmarks = () => {
        setBookmarksVersion((prev) => prev + 1);
    };

    const refreshCollections = () => {
        setCollectionsVersion((prev) => prev + 1);
    };

    const refreshTags = () => {
        setTagsVersion((prev) => prev + 1);
    };

    const refreshAll = () => {
        refreshBookmarks();
        refreshCollections();
        refreshTags();
    };

    return (
        <DataRefreshContext.Provider
            value={{
                bookmarksVersion,
                collectionsVersion,
                tagsVersion,
                refreshBookmarks,
                refreshCollections,
                refreshTags,
                refreshAll,
            }}>
            {children}
        </DataRefreshContext.Provider>
    );
};
