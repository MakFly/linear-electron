import { useScrollOverflow } from '@/hooks/use-scroll-overflow';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { ReactNode, RefObject, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type ScrollWithHintProps = {
    children: ReactNode;
    scrollRef?: RefObject<HTMLDivElement | null>;
    className?: string;
    contentClassName?: string;
    fadeClassName?: string;
    scrollStep?: number;
};

export function ScrollWithHint({
    children,
    scrollRef,
    className,
    contentClassName,
    fadeClassName = 'from-background',
    scrollStep = 160,
}: ScrollWithHintProps) {
    const { t } = useTranslation();
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = scrollRef ?? internalRef;
    const canScrollDown = useScrollOverflow(ref);

    return (
        <div className={cn('relative min-h-0', className)}>
            <div ref={ref} className={cn('scrollbar-hide h-full overflow-y-auto', contentClassName)}>
                {children}
            </div>

            {canScrollDown && (
                <>
                    <div
                        className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t to-transparent', fadeClassName)}
                    />
                    <button
                        type="button"
                        aria-label={t('common.scrollMore')}
                        onClick={() => ref.current?.scrollBy({ top: scrollStep, behavior: 'smooth' })}
                        className="app-no-drag text-muted-foreground hover:text-foreground absolute bottom-3 left-1/2 z-10 flex size-7 -translate-x-1/2 items-center justify-center rounded-full border border-[#2A2A2B] bg-[#0b0b0c]/90 shadow-lg backdrop-blur-sm transition-colors"
                    >
                        <ChevronDown className="size-4" />
                    </button>
                </>
            )}
        </div>
    );
}
