import { useEffect, useState } from 'react';

/**
 * Detects whether the app runs inside the native (Electron / NativePHP) window
 * rather than a plain web browser. Used to reserve space for the macOS traffic
 * lights, which only exist in the native title bar.
 *
 * Starts `false` so SSR and the first client render match, then resolves from
 * the Electron user-agent after mount.
 */
export function useIsNative() {
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        setIsNative(/electron/i.test(window.navigator.userAgent));
    }, []);

    return isNative;
}
