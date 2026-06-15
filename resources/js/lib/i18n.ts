import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en/common.json';
import fr from '@/locales/fr/common.json';

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

type Dict = Record<string, unknown>;

/** Recursively merge `source` into `target` (objects deep, scalars overwrite). */
function deepMerge(target: Dict, source: Dict): Dict {
    for (const key of Object.keys(source)) {
        const next = source[key];
        const prev = target[key];
        if (next && typeof next === 'object' && !Array.isArray(next) && prev && typeof prev === 'object' && !Array.isArray(prev)) {
            deepMerge(prev as Dict, next as Dict);
        } else {
            target[key] = next;
        }
    }
    return target;
}

/**
 * Per-page locale fragments live under `locales/{en,fr}/pages/*.json`. Each
 * fragment is shaped like a partial of `common.json` (e.g. `{ "settings": { … } }`)
 * and is deep-merged into the matching language so feature pages can own their
 * strings without all editing the single `common.json`. en/fr fragments must
 * keep identical key sets, per the translation rules.
 */
function mergeFragments(base: Dict, modules: Record<string, unknown>): Dict {
    for (const mod of Object.values(modules)) {
        const fragment = (mod as { default?: Dict }).default ?? (mod as Dict);
        deepMerge(base, fragment);
    }
    return base;
}

const enFragments = import.meta.glob('../locales/en/pages/*.json', { eager: true });
const frFragments = import.meta.glob('../locales/fr/pages/*.json', { eager: true });

const resources = {
    en: { common: mergeFragments({ ...en }, enFragments) },
    fr: { common: mergeFragments({ ...fr }, frFragments) },
} as const;

let initialized = false;

/**
 * Initialize the shared i18next instance. Safe to call on both the client
 * (app.tsx) and the server (ssr.jsx). Subsequent calls only switch language.
 */
export function setupI18n(locale: string | undefined): typeof i18n {
    const lng = (SUPPORTED_LANGUAGES as readonly string[]).includes(locale ?? '') ? (locale as Language) : 'en';

    if (!initialized) {
        i18n.use(initReactI18next).init({
            resources,
            lng,
            fallbackLng: 'en',
            defaultNS: 'common',
            ns: ['common'],
            interpolation: { escapeValue: false },
            react: { useSuspense: false },
        });
        initialized = true;
    } else if (i18n.language !== lng) {
        i18n.changeLanguage(lng);
    }

    return i18n;
}

export default i18n;
