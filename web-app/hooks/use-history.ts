"use client";

import { useState, useEffect, useCallback } from "react";

export type HistoryEntry = {
    id: string;
    date: string;
    originalName: string;
    originalType: string;
    originalSize: number;
    originalWidth?: number;
    originalHeight?: number;
    convertedName: string;
    convertedType: string;
    convertedSize: number;
    convertedWidth?: number;
    convertedHeight?: number;
    convertedBlob?: Blob; // Not stored in localStorage, populated when generating
    blobUrl?: string; // Appended for temporary downloads
};

const MAX_HISTORY_ENTRIES = 100;
const STORAGE_KEY = "conversionHistory";

export function useHistory() {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Error loading history:", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveHistory = useCallback((newHistory: HistoryEntry[]) => {
        try {
            // Remove blobs before saving to storage
            const storageHistory = newHistory.map(({ convertedBlob, blobUrl, ...rest }) => rest);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(storageHistory));
            setHistory(newHistory);
        } catch (error) {
            console.error("Error saving history:", error);
        }
    }, []);

    const addEntry = useCallback((entry: Omit<HistoryEntry, "id" | "date"> & { convertedBlob?: Blob }) => {
        setHistory((prev) => {
            const newEntry: HistoryEntry = {
                ...entry,
                id: Date.now().toString(),
                date: new Date().toISOString(),
            };

            const newHistory = [newEntry, ...prev].slice(0, MAX_HISTORY_ENTRIES);
            saveHistory(newHistory);
            return newHistory;
        });
    }, [saveHistory]);

    const removeEntry = useCallback((id: string) => {
        setHistory((prev) => {
            const newHistory = prev.filter((entry) => entry.id !== id);
            saveHistory(newHistory);
            return newHistory;
        });
    }, [saveHistory]);

    const clearHistory = useCallback(() => {
        saveHistory([]);
    }, [saveHistory]);

    return {
        history,
        isLoaded,
        addEntry,
        removeEntry,
        clearHistory,
    };
}
