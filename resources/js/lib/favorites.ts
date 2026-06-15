import { useSyncExternalStore } from 'react';

export interface Favorite {
    label: string;
    href: string;
}

const STORAGE_KEY = 'linear-favorites';
const listeners = new Set<() => void>();

let cache: Favorite[] = readStorage();

function readStorage(): Favorite[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
        return [];
    }
}

function write(next: Favorite[]) {
    cache = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    listeners.forEach((fn) => fn());
}

export function toggleFavorite(favorite: Favorite) {
    const exists = cache.some((f) => f.href === favorite.href);
    write(exists ? cache.filter((f) => f.href !== favorite.href) : [...cache, favorite]);
}

export function useFavorites(): Favorite[] {
    return useSyncExternalStore(
        (onChange) => {
            listeners.add(onChange);
            return () => listeners.delete(onChange);
        },
        () => cache,
        () => cache,
    );
}
