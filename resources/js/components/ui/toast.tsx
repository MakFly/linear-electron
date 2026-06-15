import { cn } from '@/lib/utils';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import * as React from 'react';
import { useSyncExternalStore } from 'react';

type ToastType = 'success' | 'info' | 'error';

type ToastInput = {
    title: string;
    description?: React.ReactNode;
};

type ToastItem = ToastInput & {
    id: number;
    type: ToastType;
};

const QUEUED_TOAST_KEY = 'linear-pending-toast';
const listeners = new Set<() => void>();
const timers = new Map<number, number>();

let nextId = 1;
let items: ToastItem[] = [];

function emit(type: ToastType, input: ToastInput) {
    const id = nextId++;

    items = [...items.slice(-3), { id, type, ...input }];
    listeners.forEach((listener) => listener());

    timers.set(
        id,
        window.setTimeout(() => dismiss(id), 5000),
    );
}

function dismiss(id: number) {
    const timer = timers.get(id);

    if (timer) {
        window.clearTimeout(timer);
        timers.delete(id);
    }

    items = items.filter((item) => item.id !== id);
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

function getSnapshot() {
    return items;
}

export const toast = {
    success: (input: ToastInput) => emit('success', input),
    info: (input: ToastInput) => emit('info', input),
    error: (input: ToastInput) => emit('error', input),
};

export function queueToast(type: ToastType, input: ToastInput) {
    if (typeof window === 'undefined') return;

    window.sessionStorage.setItem(QUEUED_TOAST_KEY, JSON.stringify({ type, ...input }));
}

export function clearQueuedToast() {
    if (typeof window === 'undefined') return;

    window.sessionStorage.removeItem(QUEUED_TOAST_KEY);
}

const toastIcons = {
    success: CheckCircle2,
    info: Info,
    error: XCircle,
};

export function ToastViewport() {
    const toasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    React.useEffect(() => {
        const queued = window.sessionStorage.getItem(QUEUED_TOAST_KEY);

        if (!queued) return;

        window.sessionStorage.removeItem(QUEUED_TOAST_KEY);

        try {
            const item = JSON.parse(queued) as ToastInput & { type?: ToastType };
            emit(item.type ?? 'info', { title: item.title, description: item.description });
        } catch {
            window.sessionStorage.removeItem(QUEUED_TOAST_KEY);
        }
    }, []);

    return (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex w-[min(380px,calc(100vw-2rem))] -translate-x-1/2 flex-col-reverse gap-2">
            {toasts.map((item) => {
                const Icon = toastIcons[item.type];

                return (
                    <div
                        key={item.id}
                        role={item.type === 'error' ? 'alert' : 'status'}
                        className={cn(
                            'border-border bg-popover text-popover-foreground pointer-events-auto flex min-h-11 items-start gap-2.5 rounded-lg border px-3 py-2.5 shadow-2xl',
                            'animate-in fade-in slide-in-from-bottom-2 duration-150',
                        )}
                    >
                        <Icon
                            className={cn(
                                'mt-0.5 size-4 shrink-0',
                                item.type === 'success' && 'text-emerald-500',
                                item.type === 'info' && 'text-muted-foreground',
                                item.type === 'error' && 'text-destructive',
                            )}
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] leading-5 font-medium">{item.title}</p>
                            {item.description && <div className="text-muted-foreground mt-0.5 text-xs leading-4">{item.description}</div>}
                        </div>
                        <button
                            type="button"
                            aria-label="Dismiss notification"
                            onClick={() => dismiss(item.id)}
                            className="text-muted-foreground hover:bg-accent hover:text-foreground -mr-1 flex size-6 shrink-0 items-center justify-center rounded-md transition-colors"
                        >
                            <X className="size-3.5" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
