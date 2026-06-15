import { StatusIcon } from '@/components/linear/status-icon';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Issue } from '@/lib/issues';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Inbox, Layers2, Search, SquarePen, UserCircle2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface PaletteAction {
    key: string;
    label: string;
    icon: React.ReactNode;
    run: () => void;
}

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    issues: Issue[];
    onNewIssue: () => void;
}

export function CommandPalette({ open, onOpenChange, issues, onNewIssue }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            setQuery('');
            setActiveIndex(0);
        }
    }, [open]);

    const go = (url: string) => {
        onOpenChange(false);
        router.visit(url);
    };

    const actions: PaletteAction[] = useMemo(
        () => [
            {
                key: 'new-issue',
                label: 'Create new issue',
                icon: <SquarePen className="text-muted-foreground size-4" />,
                run: () => {
                    onOpenChange(false);
                    onNewIssue();
                },
            },
            { key: 'inbox', label: 'Go to Inbox', icon: <Inbox className="text-muted-foreground size-4" />, run: () => go('/inbox') },
            {
                key: 'my-issues',
                label: 'Go to My issues',
                icon: <UserCircle2 className="text-muted-foreground size-4" />,
                run: () => go('/my-issues'),
            },
            {
                key: 'active',
                label: 'Go to Active issues',
                icon: <Layers2 className="text-muted-foreground size-4" />,
                run: () => go('/team/DEV/active'),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const q = query.trim().toLowerCase();
    const filteredIssues = useMemo(
        () => (q ? issues.filter((i) => i.title.toLowerCase().includes(q) || i.identifier.toLowerCase().includes(q)) : issues).slice(0, 8),
        [issues, q],
    );
    const filteredActions = useMemo(() => (q ? actions.filter((a) => a.label.toLowerCase().includes(q)) : actions), [actions, q]);

    type Entry = { type: 'issue'; issue: Issue } | { type: 'action'; action: PaletteAction };
    const entries: Entry[] = [
        ...filteredIssues.map((issue) => ({ type: 'issue', issue }) as Entry),
        ...filteredActions.map((action) => ({ type: 'action', action }) as Entry),
    ];

    const select = (entry: Entry) => {
        if (entry.type === 'issue') go(`/issue/${entry.issue.identifier}`);
        else entry.action.run();
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, entries.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && entries[activeIndex]) {
            e.preventDefault();
            select(entries[activeIndex]);
        }
    };

    useEffect(() => {
        listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border bg-popover top-[18%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 shadow-2xl">
                <DialogTitle className="sr-only">Search</DialogTitle>
                <div className="border-border flex items-center gap-2.5 border-b px-4">
                    <Search className="text-muted-foreground size-4 shrink-0" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActiveIndex(0);
                        }}
                        onKeyDown={onKeyDown}
                        placeholder="Search issues or type a command…"
                        className="text-foreground placeholder:text-muted-foreground/60 h-12 w-full bg-transparent text-sm focus:outline-none"
                    />
                </div>
                <div ref={listRef} className="max-h-80 overflow-y-auto p-1.5">
                    {filteredIssues.length > 0 && <p className="text-muted-foreground px-2.5 pt-1.5 pb-1 text-[11px] font-medium">Issues</p>}
                    {entries.map((entry, index) => (
                        <button
                            key={entry.type === 'issue' ? `i-${entry.issue.id}` : entry.action.key}
                            data-active={index === activeIndex}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => select(entry)}
                            className={cn(
                                'text-foreground flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px]',
                                index === activeIndex && 'bg-accent',
                            )}
                        >
                            {entry.type === 'issue' ? (
                                <>
                                    <StatusIcon status={entry.issue.status} />
                                    <span className="text-muted-foreground w-12 shrink-0 text-xs">{entry.issue.identifier}</span>
                                    <span className="truncate font-medium">{entry.issue.title}</span>
                                </>
                            ) : (
                                <>
                                    {entry.action.icon}
                                    <span className="font-medium">{entry.action.label}</span>
                                </>
                            )}
                        </button>
                    ))}
                    {entries.length === 0 && <p className="text-muted-foreground px-2.5 py-6 text-center text-[13px]">No results</p>}
                </div>
            </DialogContent>
        </Dialog>
    );
}
