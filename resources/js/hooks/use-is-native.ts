import { usePage } from '@inertiajs/react';

/**
 * Detects whether the app runs inside the native (NativePHP/Electron) window
 * rather than a plain web browser. Used to reserve space for the macOS traffic
 * lights, which only exist in the native title bar.
 *
 * Backed by the `isNative` Inertia prop (the server detects the NativePHP
 * `_php_native` security cookie), so it is consistent between SSR and the client
 * and does not rely on the user-agent, which NativePHP rewrites.
 */
export function useIsNative(): boolean {
    const { props } = usePage<{ isNative?: boolean }>();

    return Boolean(props.isNative);
}
