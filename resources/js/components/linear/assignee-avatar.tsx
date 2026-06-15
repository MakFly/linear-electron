import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

const PALETTE = ['bg-indigo-500', 'bg-emerald-600', 'bg-rose-500', 'bg-amber-600'];

export function AssigneeAvatar({ name, className }: { name: string | null; className?: string }) {
    if (!name) {
        return (
            <span
                aria-label="No assignee"
                className={cn(
                    'border-muted-foreground/50 flex size-[18px] shrink-0 items-center justify-center rounded-full border border-dashed',
                    className,
                )}
            >
                <User className="text-muted-foreground size-2.5" />
            </span>
        );
    }

    const color = PALETTE[name.charCodeAt(0) % PALETTE.length];

    return (
        <span
            aria-label={`Assigned to ${name}`}
            className={cn('flex size-[18px] shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white', color, className)}
        >
            {name.charAt(0).toUpperCase()}
        </span>
    );
}
