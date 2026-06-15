import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { ToastViewport } from './components/ui/toast';
import { initializeTheme } from './hooks/use-appearance';
import { setupI18n } from './lib/i18n';
import { initializePreferenceEffects, readStoredPreferences } from './lib/preferences';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const locale =
            (props.initialPage.props.auth as { user?: { preferences?: { language?: string } } } | undefined)?.user?.preferences?.language ??
            readStoredPreferences().language;
        setupI18n(locale);

        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <ToastViewport />
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
initializePreferenceEffects();
