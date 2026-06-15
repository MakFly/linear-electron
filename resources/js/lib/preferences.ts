import { type LinearPreferences } from '@/types';

const STORAGE_KEY = 'linear-preferences';

export const defaultPreferences: LinearPreferences = {
    default_home_view: 'active',
    display_names: 'full',
    first_day_of_week: 'monday',
    convert_emoticons: true,
    send_comment_on: 'enter',
    font_size: 'default',
    pointer_cursors: false,
    interface_theme: 'dark',
    open_in_desktop_app: false,
    language: 'en',
};

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export function applyPreferenceEffects(preferences: LinearPreferences) {
    if (typeof window === 'undefined') {
        return;
    }

    const root = document.documentElement;
    const isDark = preferences.interface_theme === 'dark' || (preferences.interface_theme === 'system' && prefersDark());

    root.classList.toggle('dark', isDark);
    root.classList.toggle('linear-pointer-cursors', preferences.pointer_cursors);
    root.classList.toggle('linear-font-small', preferences.font_size === 'small');
    root.classList.toggle('linear-font-large', preferences.font_size === 'large');
    localStorage.setItem('appearance', preferences.interface_theme);
}

export function initializePreferenceEffects() {
    if (typeof window === 'undefined') {
        return;
    }

    const preferences = readStoredPreferences();
    applyPreferenceEffects(preferences);
}

export function readStoredPreferences(): LinearPreferences {
    if (typeof window === 'undefined') {
        return defaultPreferences;
    }

    try {
        return {
            ...defaultPreferences,
            ...(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<LinearPreferences>),
        };
    } catch {
        return defaultPreferences;
    }
}

export function storePreferences(preferences: LinearPreferences) {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    applyPreferenceEffects(preferences);
}
