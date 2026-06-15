import { AssigneeAvatar } from '@/components/linear/assignee-avatar';
import { PriorityIcon } from '@/components/linear/priority-icon';
import { StatusIcon } from '@/components/linear/status-icon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toast';
import { PRIORITY_META, STATUS_META, STATUS_ORDER, useMembers } from '@/lib/issues';
import { router } from '@inertiajs/react';
import { CircleDot, Flag, Trash2, User, UserCircle2, X } from 'lucide-react';

interface BulkBarProps {
    ids: number[];
    onClear: () => void;
}

export function BulkBar({ ids, onClear }: BulkBarProps) {
    const members = useMembers();
    if (ids.length === 0) return null;

    const apply = (data: Record<string, unknown>) => {
        const count = ids.length;

        router.patch(
            '/issues-bulk',
            { ids, ...data },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success({ title: `${count} ${count === 1 ? 'issue' : 'issues'} updated` });
                    onClear();
                },
                onError: () => toast.error({ title: 'Bulk update failed' }),
            },
        );
    };

    const destroy = () => {
        const count = ids.length;

        router.post(
            '/issues-bulk-delete',
            { ids },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success({ title: `${count} ${count === 1 ? 'issue' : 'issues'} deleted` });
                    onClear();
                },
                onError: () => toast.error({ title: 'Bulk delete failed' }),
            },
        );
    };

    return (
        <div className="border-border bg-popover animate-in fade-in slide-in-from-bottom-2 absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-lg border px-2 py-1.5 shadow-2xl duration-150">
            <span className="text-foreground px-1.5 text-xs font-medium">{ids.length} selected</span>
            <span className="bg-border mx-0.5 h-4 w-px" />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="text-muted-foreground hover:bg-accent hover:text-foreground flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors duration-100">
                        <CircleDot className="size-3.5" />
                        Status
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" side="top" className="w-44">
                    {STATUS_ORDER.map((status) => (
                        <DropdownMenuItem key={status} className="gap-2 text-[13px]" onSelect={() => apply({ status })}>
                            <StatusIcon status={status} />
                            {STATUS_META[status].label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="text-muted-foreground hover:bg-accent hover:text-foreground flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors duration-100">
                        <Flag className="size-3.5" />
                        Priority
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" side="top" className="w-44">
                    {PRIORITY_META.map((p) => (
                        <DropdownMenuItem key={p.value} className="gap-2 text-[13px]" onSelect={() => apply({ priority: p.value })}>
                            <PriorityIcon priority={p.value} className="size-4" />
                            {p.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="text-muted-foreground hover:bg-accent hover:text-foreground flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors duration-100">
                        <UserCircle2 className="size-3.5" />
                        Assignee
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" side="top" className="w-44">
                    <DropdownMenuItem className="gap-2 text-[13px]" onSelect={() => apply({ assignee: null })}>
                        <User className="text-muted-foreground size-4" />
                        No assignee
                    </DropdownMenuItem>
                    {members.map((member) => (
                        <DropdownMenuItem key={member} className="gap-2 text-[13px]" onSelect={() => apply({ assignee: member })}>
                            <AssigneeAvatar name={member} className="size-4 text-[8px]" />
                            {member}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <button
                onClick={destroy}
                className="text-destructive hover:bg-destructive/10 flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors duration-100"
            >
                <Trash2 className="size-3.5" />
                Delete
            </button>

            <span className="bg-border mx-0.5 h-4 w-px" />
            <button
                aria-label="Clear selection"
                onClick={onClear}
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors duration-100"
            >
                <X className="size-3.5" />
            </button>
        </div>
    );
}
