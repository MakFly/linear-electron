import { LinearShell } from '@/components/linear/linear-shell';
import { PriorityIcon } from '@/components/linear/priority-icon';
import { StatusIcon } from '@/components/linear/status-icon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Cycle, Issue, IssueMetadata, IssueStatus, Label, PRIORITY_META, Project, STATUS_META } from '@/lib/issues';
import { Head, Link } from '@inertiajs/react';
import {
    Archive,
    Bell,
    Box,
    Check,
    ChevronDown,
    ChevronRight,
    Circle,
    CircleCheck,
    CircleDot,
    Clock3,
    ListFilter,
    MailOpen,
    MessageSquare,
    MoreHorizontal,
    Search,
    SlidersHorizontal,
    User,
    X,
} from 'lucide-react';
import { ReactNode, forwardRef, useMemo, useState } from 'react';

type NotificationType = 'mention' | 'assignment' | 'status' | 'comment' | 'project';
type Ordering = 'newest' | 'oldest';

interface InboxNotification {
    id: number;
    type: NotificationType;
    actor: string;
    actorInitials: string;
    issueIdentifier: string;
    issueTitle: string;
    issueStatus: IssueStatus;
    issuePriority: number;
    project: string;
    title: string;
    body: string;
    time: string;
    read: boolean;
    snoozed: boolean;
}

const mockNotifications: InboxNotification[] = [
    {
        id: 1,
        type: 'mention',
        actor: 'Kevin Aubree',
        actorInitials: 'KA',
        issueIdentifier: 'DEV-24',
        issueTitle: 'Check cross-status ordering',
        issueStatus: 'in_progress',
        issuePriority: 2,
        project: 'Linear clone parity',
        title: 'mentioned you in a comment',
        body: 'Can you verify the Inbox filters after the DnD changes? The display options should behave like Linear before we close this pass.',
        time: '2m',
        read: false,
        snoozed: false,
    },
    {
        id: 2,
        type: 'assignment',
        actor: 'Devaubree',
        actorInitials: 'DE',
        issueIdentifier: 'DEV-19',
        issueTitle: 'Check Todo to Done move',
        issueStatus: 'todo',
        issuePriority: 3,
        project: 'Linear clone parity',
        title: 'assigned an issue to you',
        body: 'You were assigned DEV-19 while testing reordered active issues.',
        time: '18m',
        read: false,
        snoozed: false,
    },
    {
        id: 3,
        type: 'status',
        actor: 'Linear Bot',
        actorInitials: 'LB',
        issueIdentifier: 'DEV-5',
        issueTitle: 'Fix compact settings mobile layout',
        issueStatus: 'done',
        issuePriority: 1,
        project: 'Linear clone parity',
        title: 'moved an issue to Done',
        body: 'The settings layout issue was completed after the profile sidebar spacing fix.',
        time: '1h',
        read: true,
        snoozed: false,
    },
    {
        id: 4,
        type: 'comment',
        actor: 'Ariane Martin',
        actorInitials: 'AM',
        issueIdentifier: 'DEV-20',
        issueTitle: 'Validate Active issue move',
        issueStatus: 'in_progress',
        issuePriority: 4,
        project: 'QA parity',
        title: 'left a new comment',
        body: 'The row drag still feels good after disabling text selection. Inbox should expose the same filters as the issue list.',
        time: '3h',
        read: true,
        snoozed: true,
    },
    {
        id: 5,
        type: 'project',
        actor: 'Devaubree',
        actorInitials: 'DE',
        issueIdentifier: 'DEV-3',
        issueTitle: 'Connect your tools',
        issueStatus: 'todo',
        issuePriority: 0,
        project: 'Integrations',
        title: 'updated a project notification',
        body: 'A linked GitHub integration note was added to the project timeline.',
        time: 'Yesterday',
        read: true,
        snoozed: false,
    },
];

const typeLabels: Record<NotificationType, string> = {
    mention: 'Mention',
    assignment: 'Assignment',
    status: 'Issue update',
    comment: 'Comment',
    project: 'Project update',
};

const typeIcons: Record<NotificationType, ReactNode> = {
    mention: <MessageSquare className="size-3.5" />,
    assignment: <User className="size-3.5" />,
    status: <CircleDot className="size-3.5" />,
    comment: <MessageSquare className="size-3.5" />,
    project: <Box className="size-3.5" />,
};

const ToolbarButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }>(
    ({ label, active, children, type = 'button', ...props }, ref) => {
        return (
            <button
                ref={ref}
                type={type}
                aria-label={label}
                data-active={active || undefined}
                className="text-muted-foreground hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground data-[active]:bg-accent data-[active]:text-foreground flex size-7 items-center justify-center rounded-full transition-colors"
                {...props}
            >
                {children}
            </button>
        );
    },
);

ToolbarButton.displayName = 'ToolbarButton';

function InboxTooltip({ children, label, side = 'bottom' }: { children: ReactNode; label: ReactNode; side?: 'top' | 'right' | 'bottom' | 'left' }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent
                side={side}
                sideOffset={7}
                className="rounded-md border-[lch(22.88_1.83_272)] bg-[lch(9.92_0.75_272)] px-2 py-1 text-[11px] font-medium text-[lch(90.895_1.375_272)] shadow-2xl"
            >
                {label}
            </TooltipContent>
        </Tooltip>
    );
}

function LinearSwitch({ checked }: { checked: boolean }) {
    return (
        <span
            data-state={checked ? 'checked' : 'unchecked'}
            className="relative ml-auto inline-flex h-4 w-7 shrink-0 items-center rounded-full bg-[lch(47.679_0.875_271.999)] transition-colors data-[state=checked]:bg-[lch(47.918_59.303_288.421)]"
        >
            <span
                className="ml-0.5 size-3 rounded-full bg-white transition-transform data-[state=checked]:translate-x-3.5"
                data-state={checked ? 'checked' : 'unchecked'}
            />
        </span>
    );
}

function MenuOption({
    icon,
    label,
    checked,
    suffix,
    onSelect,
}: {
    icon: ReactNode;
    label: string;
    checked?: boolean;
    suffix?: ReactNode;
    onSelect: () => void;
}) {
    return (
        <DropdownMenuItem
            className="h-8 gap-2 rounded-lg text-[13px]"
            onSelect={(event) => {
                event.preventDefault();
                onSelect();
            }}
        >
            <span className="text-muted-foreground flex size-4 items-center justify-center">{icon}</span>
            <span>{label}</span>
            {suffix && <span className="text-muted-foreground ml-auto text-xs">{suffix}</span>}
            {checked && <Check className="ml-auto size-3.5" />}
        </DropdownMenuItem>
    );
}

function EmptyInbox() {
    return (
        <div className="flex h-full flex-col items-center justify-center pb-24 text-center">
            <div className="relative mb-6 flex h-[92px] w-[92px] items-center justify-center">
                <div className="absolute inset-x-2 bottom-3 h-8 rounded-[16px] border-2 border-[lch(63.582_1.375_272)] opacity-70" />
                <div className="absolute top-3 h-[72px] w-[76px] rounded-[18px] border-2 border-[lch(63.582_1.375_272)] opacity-80" />
                <div className="absolute bottom-[26px] h-4 w-10 rounded-b-xl border-x-2 border-b-2 border-[lch(63.582_1.375_272)] opacity-80" />
            </div>
            <div className="text-muted-foreground text-[13px] font-medium">No notifications</div>
        </div>
    );
}

function NotificationIcon({ type }: { type: NotificationType }) {
    return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[lch(16.091_0.943_272)] text-[lch(90.895_1.375_272)]">
            {typeIcons[type]}
        </span>
    );
}

function FilterChip({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
    return (
        <span className="border-border bg-secondary/50 text-foreground inline-flex h-8 max-w-full items-center overflow-hidden rounded-lg border text-[13px]">
            <span className="text-muted-foreground border-border flex h-full items-center border-r px-2.5">{label}</span>
            <span className="min-w-0 truncate px-2.5">{value}</span>
            <InboxTooltip label={`Remove ${label} filter`} side="top">
                <button
                    type="button"
                    aria-label={`Remove ${label} filter`}
                    onClick={onRemove}
                    className="hover:bg-accent text-muted-foreground flex h-full w-7 items-center justify-center"
                >
                    <X className="size-3.5" />
                </button>
            </InboxTooltip>
        </span>
    );
}

export default function InboxPage({ issues, labels, projects, cycles }: { issues: Issue[]; labels: Label[]; projects: Project[]; cycles: Cycle[] }) {
    const metadata: IssueMetadata = { labels, projects, cycles };
    const [selectedId, setSelectedId] = useState(mockNotifications[0]?.id ?? null);
    const [query, setQuery] = useState('');
    const [ordering, setOrdering] = useState<Ordering>('newest');
    const [showSnoozed, setShowSnoozed] = useState(false);
    const [showRead, setShowRead] = useState(true);
    const [showUnreadFirst, setShowUnreadFirst] = useState(false);
    const [showId, setShowId] = useState(true);
    const [showStatusIcon, setShowStatusIcon] = useState(true);
    const [typeFilter, setTypeFilter] = useState<NotificationType | null>(null);
    const [fromFilter, setFromFilter] = useState<string | null>(null);
    const [projectFilter, setProjectFilter] = useState<string | null>(null);
    const [priorityFilter, setPriorityFilter] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<IssueStatus | null>(null);
    const [items, setItems] = useState(mockNotifications);

    const actors = useMemo(() => [...new Set(items.map((item) => item.actor))], [items]);
    const inboxProjects = useMemo(() => [...new Set(items.map((item) => item.project))], [items]);
    const activeFilters = Boolean(typeFilter || fromFilter || projectFilter || priorityFilter !== null || statusFilter);

    const visibleItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        let result = items.filter((item) => {
            if (!showSnoozed && item.snoozed) return false;
            if (!showRead && item.read) return false;
            if (typeFilter && item.type !== typeFilter) return false;
            if (fromFilter && item.actor !== fromFilter) return false;
            if (projectFilter && item.project !== projectFilter) return false;
            if (priorityFilter !== null && item.issuePriority !== priorityFilter) return false;
            if (statusFilter && item.issueStatus !== statusFilter) return false;
            if (normalizedQuery) {
                const haystack = `${item.actor} ${item.issueIdentifier} ${item.issueTitle} ${item.title} ${item.body} ${item.project}`.toLowerCase();
                if (!haystack.includes(normalizedQuery)) return false;
            }
            return true;
        });

        result = [...result].sort((a, b) => {
            if (showUnreadFirst && a.read !== b.read) return a.read ? 1 : -1;
            return ordering === 'newest' ? a.id - b.id : b.id - a.id;
        });

        return result;
    }, [fromFilter, items, ordering, priorityFilter, projectFilter, query, showRead, showSnoozed, showUnreadFirst, statusFilter, typeFilter]);

    const selected = visibleItems.find((item) => item.id === selectedId) ?? visibleItems[0] ?? null;

    const clearFilters = () => {
        setTypeFilter(null);
        setFromFilter(null);
        setProjectFilter(null);
        setPriorityFilter(null);
        setStatusFilter(null);
        setQuery('');
    };

    const updateItem = (id: number, data: Partial<InboxNotification>) => {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, ...data } : item)));
    };

    const archiveSelected = () => {
        if (!selected) return;
        setItems((current) => current.filter((item) => item.id !== selected.id));
        toast.success({ title: 'Notification archived' });
    };

    const preventToolbarDropdownFocusRestore = (event: Event) => {
        event.preventDefault();
        requestAnimationFrame(() => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        });
    };

    return (
        <LinearShell issues={issues} metadata={metadata}>
            <Head title="Inbox" />
            <TooltipProvider delayDuration={350}>
                <div className="flex min-h-0 flex-1 bg-[lch(4.52_0.3_272)] text-[lch(90.895_1.375_272)]">
                    <section className="flex min-h-0 w-[414px] shrink-0 flex-col border-r border-[lch(12.08_1.38_272)]">
                        <header className="flex h-11 shrink-0 items-center justify-between border-b border-[lch(12.08_1.38_272)] px-5">
                            <h1 className="text-[13px] font-medium">Inbox</h1>
                            <div className="flex items-center gap-0.5">
                                <DropdownMenu>
                                    <InboxTooltip label="Add filter">
                                        <DropdownMenuTrigger asChild>
                                            <ToolbarButton label="Add filter" active={activeFilters}>
                                                <ListFilter className="size-4" />
                                            </ToolbarButton>
                                        </DropdownMenuTrigger>
                                    </InboxTooltip>
                                    <DropdownMenuContent
                                        align="end"
                                        sideOffset={6}
                                        onCloseAutoFocus={preventToolbarDropdownFocusRestore}
                                        className="w-[216px] rounded-xl border-[lch(22.88_1.83_272)] bg-[lch(9.92_0.75_272)] p-1.5 shadow-2xl"
                                    >
                                        <div className="relative mb-1">
                                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                                            <input
                                                value={query}
                                                onChange={(event) => setQuery(event.target.value)}
                                                placeholder={activeFilters ? 'Showing filtered items' : 'Add Filter...'}
                                                className="text-foreground placeholder:text-muted-foreground h-8 w-full rounded-lg bg-transparent pr-8 pl-7 text-[13px] outline-none"
                                                onKeyDown={(event) => event.stopPropagation()}
                                            />
                                            <kbd className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded bg-[lch(16.091_0.943_272)] px-1.5 py-0.5 text-[10px]">
                                                F
                                            </kbd>
                                        </div>
                                        <DropdownMenuSeparator className="-mx-1.5 my-1" />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="hover:bg-accent flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px]">
                                                    <Bell className="text-muted-foreground size-4" />
                                                    Notification type
                                                    <ChevronRight className="text-muted-foreground ml-auto size-3.5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                side="right"
                                                align="start"
                                                className="w-48 rounded-xl border-[lch(22.88_1.83_272)] bg-[lch(9.92_0.75_272)] p-1.5 shadow-2xl"
                                            >
                                                {(Object.keys(typeLabels) as NotificationType[]).map((type) => (
                                                    <MenuOption
                                                        key={type}
                                                        icon={typeIcons[type]}
                                                        label={typeLabels[type]}
                                                        checked={typeFilter === type}
                                                        onSelect={() => setTypeFilter(type)}
                                                    />
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="hover:bg-accent flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px]">
                                                    <User className="text-muted-foreground size-4" />
                                                    From
                                                    <ChevronRight className="text-muted-foreground ml-auto size-3.5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                side="right"
                                                align="start"
                                                className="w-52 rounded-xl border-[lch(22.88_1.83_272)] bg-[lch(9.92_0.75_272)] p-1.5 shadow-2xl"
                                            >
                                                {actors.map((actor) => (
                                                    <MenuOption
                                                        key={actor}
                                                        icon={<User className="size-3.5" />}
                                                        label={actor}
                                                        checked={fromFilter === actor}
                                                        onSelect={() => setFromFilter(actor)}
                                                    />
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="hover:bg-accent flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px]">
                                                    <Box className="text-muted-foreground size-4" />
                                                    Project
                                                    <ChevronRight className="text-muted-foreground ml-auto size-3.5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                side="right"
                                                align="start"
                                                className="w-52 rounded-xl border-[lch(22.88_1.83_272)] bg-[lch(9.92_0.75_272)] p-1.5 shadow-2xl"
                                            >
                                                {inboxProjects.map((project) => (
                                                    <MenuOption
                                                        key={project}
                                                        icon={<Box className="size-3.5" />}
                                                        label={project}
                                                        checked={projectFilter === project}
                                                        onSelect={() => setProjectFilter(project)}
                                                    />
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="hover:bg-accent flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px]">
                                                    <PriorityIcon priority={2} className="size-4" />
                                                    Issue priority
                                                    <ChevronRight className="text-muted-foreground ml-auto size-3.5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                side="right"
                                                align="start"
                                                className="w-48 rounded-xl border-[lch(22.88_1.83_272)] bg-[lch(9.92_0.75_272)] p-1.5 shadow-2xl"
                                            >
                                                {PRIORITY_META.map((priority) => (
                                                    <MenuOption
                                                        key={priority.value}
                                                        icon={<PriorityIcon priority={priority.value} className="size-4" />}
                                                        label={priority.label}
                                                        checked={priorityFilter === priority.value}
                                                        onSelect={() => setPriorityFilter(priority.value)}
                                                    />
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="hover:bg-accent flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px]">
                                                    <Circle className="text-muted-foreground size-4" />
                                                    Issue status type
                                                    <ChevronRight className="text-muted-foreground ml-auto size-3.5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                side="right"
                                                align="start"
                                                className="w-48 rounded-xl border-[lch(22.88_1.83_272)] bg-[lch(9.92_0.75_272)] p-1.5 shadow-2xl"
                                            >
                                                {(['backlog', 'todo', 'in_progress', 'done', 'canceled'] as IssueStatus[]).map((status) => (
                                                    <MenuOption
                                                        key={status}
                                                        icon={<StatusIcon status={status} />}
                                                        label={STATUS_META[status].label}
                                                        checked={statusFilter === status}
                                                        onSelect={() => setStatusFilter(status)}
                                                    />
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <InboxTooltip label="Display options">
                                        <DropdownMenuTrigger asChild>
                                            <ToolbarButton
                                                label="Display options"
                                                active={showSnoozed || !showRead || showUnreadFirst || !showId || !showStatusIcon}
                                            >
                                                <SlidersHorizontal className="size-4" />
                                            </ToolbarButton>
                                        </DropdownMenuTrigger>
                                    </InboxTooltip>
                                    <DropdownMenuContent
                                        align="end"
                                        sideOffset={6}
                                        onCloseAutoFocus={preventToolbarDropdownFocusRestore}
                                        className="w-[312px] rounded-xl border-[lch(22.88_1.83_272)] bg-[lch(9.92_0.75_272)] p-3 shadow-2xl"
                                    >
                                        <div className="mb-3 flex h-8 items-center text-[13px]">
                                            <span className="text-muted-foreground font-medium">Ordering</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="bg-accent text-foreground ml-auto flex h-7 items-center gap-1 rounded-lg px-2 text-xs">
                                                        {ordering === 'newest' ? 'Newest' : 'Oldest'}
                                                        <ChevronDown className="size-3.5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-32 rounded-xl border-[lch(22.88_1.83_272)] bg-[lch(9.92_0.75_272)] p-1.5">
                                                    <DropdownMenuItem onSelect={() => setOrdering('newest')}>Newest</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => setOrdering('oldest')}>Oldest</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        {[
                                            ['Show snoozed', showSnoozed, setShowSnoozed],
                                            ['Show read', showRead, setShowRead],
                                            ['Show unread first', showUnreadFirst, setShowUnreadFirst],
                                        ].map(([label, checked, setter]) => (
                                            <DropdownMenuItem
                                                key={label as string}
                                                className="mx-1 h-8 rounded-lg px-2 text-[13px]"
                                                onSelect={(event) => {
                                                    event.preventDefault();
                                                    (setter as (value: boolean) => void)(!(checked as boolean));
                                                }}
                                            >
                                                {label as string}
                                                <LinearSwitch checked={checked as boolean} />
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator className="-mx-3 my-3" />
                                        <div className="text-muted-foreground mb-2 text-[13px] font-medium">Display properties</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            <InboxTooltip label={showId ? 'Hide issue ID' : 'Show issue ID'} side="top">
                                                <button
                                                    type="button"
                                                    data-active={showId || undefined}
                                                    onClick={() => setShowId((value) => !value)}
                                                    className="bg-accent/40 text-muted-foreground data-[active]:bg-accent data-[active]:text-foreground hover:bg-accent h-6 rounded-full px-2 text-xs font-medium"
                                                >
                                                    ID
                                                </button>
                                            </InboxTooltip>
                                            <InboxTooltip label={showStatusIcon ? 'Hide status icon' : 'Show status icon'} side="top">
                                                <button
                                                    type="button"
                                                    data-active={showStatusIcon || undefined}
                                                    onClick={() => setShowStatusIcon((value) => !value)}
                                                    className="bg-accent/40 text-muted-foreground data-[active]:bg-accent data-[active]:text-foreground hover:bg-accent h-6 rounded-full px-2 text-xs font-medium"
                                                >
                                                    Status and icon
                                                </button>
                                            </InboxTooltip>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </header>

                        {activeFilters && (
                            <div className="border-b border-[lch(12.08_1.38_272)] px-3 py-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {typeFilter && (
                                        <FilterChip label="Notification type" value={typeLabels[typeFilter]} onRemove={() => setTypeFilter(null)} />
                                    )}
                                    {fromFilter && <FilterChip label="From" value={fromFilter} onRemove={() => setFromFilter(null)} />}
                                    {projectFilter && <FilterChip label="Project" value={projectFilter} onRemove={() => setProjectFilter(null)} />}
                                    {priorityFilter !== null && (
                                        <FilterChip
                                            label="Priority"
                                            value={PRIORITY_META.find((p) => p.value === priorityFilter)?.label ?? 'Priority'}
                                            onRemove={() => setPriorityFilter(null)}
                                        />
                                    )}
                                    {statusFilter && (
                                        <FilterChip label="Status" value={STATUS_META[statusFilter].label} onRemove={() => setStatusFilter(null)} />
                                    )}
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-muted-foreground hover:text-foreground ml-auto h-8 px-2 text-[13px]"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {visibleItems.length > 0 ? (
                                <div className="py-1">
                                    {visibleItems.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedId(item.id);
                                                if (!item.read) updateItem(item.id, { read: true });
                                            }}
                                            data-active={selected?.id === item.id || undefined}
                                            className="group hover:bg-accent/45 data-[active]:bg-accent/75 flex w-full gap-3 border-b border-[lch(12.08_1.38_272)] px-4 py-3 text-left transition-colors"
                                        >
                                            <NotificationIcon type={item.type} />
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    {!item.read && <span className="size-1.5 rounded-full bg-[lch(47.918_59.303_288.421)]" />}
                                                    <span className="truncate text-[13px] font-medium">{item.actor}</span>
                                                    <span className="text-muted-foreground ml-auto shrink-0 text-[12px]">{item.time}</span>
                                                </div>
                                                <div className="truncate text-[13px]">{item.title}</div>
                                                <div className="text-muted-foreground mt-1 line-clamp-2 text-[12px] leading-5">{item.body}</div>
                                                <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                                                    {showStatusIcon && <StatusIcon status={item.issueStatus} />}
                                                    {showId && <span className="text-muted-foreground font-mono">{item.issueIdentifier}</span>}
                                                    <span className="text-muted-foreground truncate">{item.issueTitle}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <EmptyInbox />
                            )}
                        </div>
                    </section>

                    <section className="min-w-0 flex-1">
                        {selected ? (
                            <article className="flex h-full min-h-0 flex-col">
                                <header className="flex h-11 shrink-0 items-center gap-1 border-b border-[lch(12.08_1.38_272)] px-5">
                                    <InboxTooltip label={selected.read ? 'Mark as unread' : 'Mark as read'}>
                                        <button
                                            type="button"
                                            aria-label={selected.read ? 'Mark as unread' : 'Mark as read'}
                                            onClick={() => updateItem(selected.id, { read: !selected.read })}
                                            className="hover:bg-accent text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-md"
                                        >
                                            {selected.read ? <MailOpen className="size-4" /> : <CircleCheck className="size-4" />}
                                        </button>
                                    </InboxTooltip>
                                    <InboxTooltip label="Archive notification">
                                        <button
                                            type="button"
                                            aria-label="Archive notification"
                                            onClick={archiveSelected}
                                            className="hover:bg-accent text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-md"
                                        >
                                            <Archive className="size-4" />
                                        </button>
                                    </InboxTooltip>
                                    <InboxTooltip label={selected.snoozed ? 'Unsnooze notification' : 'Snooze notification'}>
                                        <button
                                            type="button"
                                            aria-label={selected.snoozed ? 'Unsnooze notification' : 'Snooze notification'}
                                            onClick={() => {
                                                updateItem(selected.id, { snoozed: !selected.snoozed });
                                                toast.info({ title: selected.snoozed ? 'Notification unsnoozed' : 'Notification snoozed' });
                                            }}
                                            className="hover:bg-accent text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-md"
                                        >
                                            <Clock3 className="size-4" />
                                        </button>
                                    </InboxTooltip>
                                    <InboxTooltip label="More actions">
                                        <button
                                            type="button"
                                            aria-label="More actions"
                                            className="hover:bg-accent text-muted-foreground hover:text-foreground ml-auto flex size-7 items-center justify-center rounded-md"
                                        >
                                            <MoreHorizontal className="size-4" />
                                        </button>
                                    </InboxTooltip>
                                </header>
                                <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
                                    <div className="mb-6 flex items-start gap-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[lch(16.091_0.943_272)] text-[12px] font-semibold">
                                            {selected.actorInitials}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[14px] font-medium">{selected.actor}</div>
                                            <div className="text-muted-foreground text-[13px]">{selected.title}</div>
                                        </div>
                                        <div className="text-muted-foreground ml-auto text-[12px]">{selected.time}</div>
                                    </div>
                                    <Link
                                        href={`/issue/${selected.issueIdentifier}`}
                                        className="hover:bg-accent/45 mb-6 flex items-center gap-3 rounded-lg border border-[lch(22.88_1.83_272)] bg-[lch(9.92_0.75_272)] px-4 py-3 transition-colors"
                                    >
                                        <StatusIcon status={selected.issueStatus} />
                                        <span className="text-muted-foreground font-mono text-[12px]">{selected.issueIdentifier}</span>
                                        <span className="min-w-0 truncate text-[13px] font-medium">{selected.issueTitle}</span>
                                        <PriorityIcon priority={selected.issuePriority} className="ml-auto size-4" />
                                    </Link>
                                    <div className="max-w-2xl">
                                        <p className="mb-3 text-[15px] leading-6">{selected.body}</p>
                                        <p className="text-muted-foreground text-[13px] leading-6">
                                            This mock notification gives the Inbox the same working surface as Linear: triage the item, open the
                                            issue, archive it, mark it read, snooze it, or narrow the list with filters.
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ) : (
                            <EmptyInbox />
                        )}
                    </section>
                </div>
            </TooltipProvider>
        </LinearShell>
    );
}
