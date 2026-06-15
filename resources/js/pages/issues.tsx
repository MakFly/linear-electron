import { BulkBar } from '@/components/linear/bulk-bar';
import { FacetsPanel, PanelTab, PanelToggleIcon } from '@/components/linear/facets-panel';
import { IssueDisplayProperty, IssueRow } from '@/components/linear/issue-row';
import { LinearShell } from '@/components/linear/linear-shell';
import { HeaderIconButton, PageHeader, TeamBadge } from '@/components/linear/page-header';
import { PriorityIcon } from '@/components/linear/priority-icon';
import { useShell } from '@/components/linear/shell-context';
import { StatusIcon } from '@/components/linear/status-icon';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toast';
import { toggleFavorite, useFavorites } from '@/lib/favorites';
import {
    Cycle,
    Grouping,
    Issue,
    IssueMetadata,
    IssueStatus,
    IssueView,
    Label,
    PRIORITY_META,
    Project,
    STATUS_ORDER,
    VIEW_STATUSES,
} from '@/lib/issues';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    Bell,
    Bot,
    Box,
    CalendarDays,
    Check,
    ChevronDown,
    ChevronRight,
    CircleDot,
    CircleOff,
    FileText,
    Flag,
    GitBranch,
    LayoutGrid,
    Link2,
    List,
    ListFilter,
    Plus,
    Repeat2,
    Search,
    SlidersHorizontal,
    Sparkles,
    Star,
    Tag,
    Type,
    User,
    X,
} from 'lucide-react';
import { DragEvent, forwardRef, MouseEvent, PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type NativePointerEvent = globalThis.PointerEvent;
type NativeMouseEvent = globalThis.MouseEvent;

const TABS: { view: IssueView; labelKey: string }[] = [
    { view: 'all', labelKey: 'issues.tabs.all' },
    { view: 'active', labelKey: 'issues.tabs.active' },
    { view: 'backlog', labelKey: 'issues.tabs.backlog' },
];

interface IssuesPageProps {
    view: IssueView;
    issues: Issue[];
    labels: Label[];
    projects: Project[];
    cycles: Cycle[];
}

interface Group {
    key: string;
    label: string;
    icon: React.ReactNode;
    newIssueStatus: IssueStatus;
    items: Issue[];
}

type DropPosition = 'before' | 'after' | 'end';

interface DropTarget {
    groupKey: string;
    issueId: number | null;
    position: DropPosition;
}

type Ordering = 'manual' | 'priority' | 'created' | 'updated';
type IssueLayout = 'list' | 'board';
type FilterOperator = 'is' | 'is_not';
type FilterType = 'status' | 'priority' | 'assignee' | 'label' | 'project' | 'cycle';
type FilterMenuOption = {
    key: string;
    label: string;
    searchText?: string;
    icon?: React.ReactNode;
    suffix?: React.ReactNode;
    checked?: boolean;
    disabled?: boolean;
    keepOpen?: boolean;
    onSelect?: () => void;
};
type ActiveFilterClauseData = {
    key: string;
    type: FilterType;
    icon: React.ReactNode;
    label: string;
    operator: FilterOperator;
    value: React.ReactNode;
    valuePrefix?: React.ReactNode;
    fieldOptions: FilterMenuOption[];
    valueOptions: FilterMenuOption[];
    onOperatorChange: (operator: FilterOperator) => void;
    onRemove: () => void;
};

function isInteractiveDragTarget(target: EventTarget | null) {
    return (
        target instanceof HTMLElement &&
        Boolean(target.closest('button, a, input, textarea, select, [role="checkbox"], [data-radix-collection-item]'))
    );
}

const LinearToolbarButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }>(
    ({ label, active, children, className, type = 'button', ...props }, ref) => {
        return (
            <button
                ref={ref}
                type={type}
                aria-label={label}
                data-active={active || undefined}
                className={cn(
                    'text-muted-foreground hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground flex size-7 items-center justify-center rounded-full transition-colors duration-100',
                    'data-[active]:bg-accent data-[active]:text-foreground',
                    className,
                )}
                {...props}
            >
                {children}
            </button>
        );
    },
);

LinearToolbarButton.displayName = 'LinearToolbarButton';

function LinearSwitch({ checked }: { checked: boolean }) {
    return (
        <span
            data-state={checked ? 'checked' : 'unchecked'}
            className="bg-muted-foreground/30 data-[state=checked]:bg-primary relative ml-auto inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors"
        >
            <span
                data-state={checked ? 'checked' : 'unchecked'}
                className="bg-foreground ml-0.5 size-3 rounded-full transition-transform data-[state=checked]:translate-x-3.5"
            />
        </span>
    );
}

function DisplayChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
    return (
        <button
            type="button"
            data-active={active || undefined}
            onClick={onClick}
            className="bg-accent/40 text-muted-foreground data-[active]:bg-accent data-[active]:text-foreground hover:bg-accent h-6 rounded-full px-2 text-xs font-medium transition-colors"
        >
            {children}
        </button>
    );
}

function FilterValueAvatar({ label, color }: { label: string; color?: string }) {
    return (
        <span
            className="text-background inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold"
            style={{ backgroundColor: color ?? '#6E7681' }}
        >
            {label.slice(0, 1).toUpperCase()}
        </span>
    );
}

function SearchableFilterOptions({
    placeholder,
    options,
    emptyLabel,
}: {
    placeholder: string;
    options: FilterMenuOption[];
    emptyLabel?: string;
}) {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const resolvedEmptyLabel = emptyLabel ?? t('common.noResults');
    const normalizedQuery = query.trim().toLowerCase();
    const filteredOptions = normalizedQuery
        ? options.filter((option) => (option.searchText ?? option.label).toLowerCase().includes(normalizedQuery))
        : options;

    return (
        <>
            <div className="relative p-1">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={placeholder}
                    className="text-foreground placeholder:text-muted-foreground h-8 w-full rounded-lg bg-transparent pr-2 pl-7 text-[13px] outline-none"
                    onKeyDown={(event) => event.stopPropagation()}
                />
            </div>
            {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.key}
                        disabled={option.disabled}
                        className="h-8 gap-2 rounded-lg text-[13px]"
                        onSelect={(event) => {
                            option.onSelect?.();
                            if (option.keepOpen) event.preventDefault();
                        }}
                    >
                        {option.icon}
                        <span className="min-w-0 truncate">{option.label}</span>
                        {option.suffix && <span className="text-muted-foreground ml-auto shrink-0 text-xs">{option.suffix}</span>}
                        {option.checked && <Check className={cn('size-3.5 shrink-0', !option.suffix && 'ml-auto')} />}
                    </DropdownMenuItem>
                ))
            ) : (
                <div className="text-muted-foreground px-3 py-2 text-[13px]">{resolvedEmptyLabel}</div>
            )}
        </>
    );
}

function ActiveFilterClause({
    fieldOptions,
    icon,
    label,
    operator,
    value,
    valuePrefix,
    valueOptions,
    onOperatorChange,
    onRemove,
}: {
    fieldOptions: FilterMenuOption[];
    icon: React.ReactNode;
    label: string;
    operator: FilterOperator;
    value: React.ReactNode;
    valuePrefix?: React.ReactNode;
    valueOptions: FilterMenuOption[];
    onOperatorChange: (operator: FilterOperator) => void;
    onRemove: () => void;
}) {
    const { t } = useTranslation();
    return (
        <div className="border-border/70 bg-background/60 text-foreground flex h-8 min-w-0 items-center overflow-hidden rounded-lg border text-[13px] shadow-sm">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="text-muted-foreground border-border/60 hover:bg-accent hover:text-foreground flex h-full items-center gap-1.5 border-r px-2.5 transition-colors"
                    >
                        {icon}
                        {label}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="border-border/80 bg-popover/95 w-[216px] rounded-xl p-1.5 shadow-2xl">
                    <SearchableFilterOptions placeholder={t('issues.addFilter')} options={fieldOptions} />
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="text-muted-foreground border-border/60 hover:bg-accent hover:text-foreground flex h-full items-center border-r px-2.5 transition-colors"
                    >
                        {operator === 'is' ? t('issues.operator.is') : t('issues.operator.isNot')}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="border-border/80 bg-popover/95 w-32 rounded-xl p-1.5 shadow-2xl">
                    {(['is', 'is_not'] as FilterOperator[]).map((option) => (
                        <DropdownMenuItem key={option} className="h-8 rounded-lg text-[13px]" onSelect={() => onOperatorChange(option)}>
                            {option === 'is' ? t('issues.operator.is') : t('issues.operator.isNot')}
                            {operator === option && <Check className="ml-auto size-3.5" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button type="button" className="hover:bg-accent flex h-full min-w-0 items-center gap-1.5 px-2.5 transition-colors">
                        {valuePrefix}
                        <span className="truncate">{value}</span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="border-border/80 bg-popover/95 w-56 rounded-xl p-1.5 shadow-2xl">
                    <SearchableFilterOptions placeholder={label} options={valueOptions} />
                </DropdownMenuContent>
            </DropdownMenu>
            <button
                type="button"
                aria-label={t('issues.removeFilter', { label })}
                onClick={onRemove}
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex h-full w-7 shrink-0 items-center justify-center transition-colors"
            >
                <X className="size-3.5" />
            </button>
        </div>
    );
}

function FilterEmptyIllustration() {
    return (
        <div className="border-border/70 bg-secondary/20 relative mb-7 flex h-16 w-24 -rotate-12 items-center justify-center rounded-xl border border-dashed">
            <div className="flex rotate-12 flex-col items-end gap-1">
                <span className="border-muted-foreground/70 block h-2 w-14 rounded-full border" />
                <span className="border-muted-foreground/60 block h-2 w-12 rounded-full border" />
                <span className="border-muted-foreground/50 block h-2 w-8 rounded-full border" />
            </div>
        </div>
    );
}

function IssuesContent({ view, issues, labels, projects, cycles }: IssuesPageProps) {
    const { t } = useTranslation();
    const statusLabel = (status: IssueStatus) => t(`status.${status}`);
    const priorityLabel = (value: number) => t(`priority.${value}`);
    const { openNewIssue } = useShell();
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [grouping, setGrouping] = useState<Grouping>('status');
    const [subGrouping, setSubGrouping] = useState<Grouping>('none');
    const [ordering, setOrdering] = useState<Ordering>('manual');
    const [layout, setLayout] = useState<IssueLayout>('list');
    const [showSubIssues, setShowSubIssues] = useState(true);
    const [showEmptyGroups, setShowEmptyGroups] = useState(false);
    const [nestedSubIssues, setNestedSubIssues] = useState(false);
    const [displayProperties, setDisplayProperties] = useState<Set<IssueDisplayProperty>>(
        () => new Set(['id', 'status', 'assignee', 'priority', 'project', 'due_date', 'labels', 'created']),
    );
    const [statusFilters, setStatusFilters] = useState<Set<IssueStatus>>(new Set());
    const [priorityFilters, setPriorityFilters] = useState<Set<number>>(new Set());
    const [labelFilters, setLabelFilters] = useState<Set<number>>(new Set());
    const [projectFilters, setProjectFilters] = useState<Set<number>>(new Set());
    const [cycleFilters, setCycleFilters] = useState<Set<number>>(new Set());
    const [statusOperator, setStatusOperator] = useState<FilterOperator>('is');
    const [priorityOperator, setPriorityOperator] = useState<FilterOperator>('is');
    const [assigneeOperator, setAssigneeOperator] = useState<FilterOperator>('is');
    const [labelOperator, setLabelOperator] = useState<FilterOperator>('is');
    const [projectOperator, setProjectOperator] = useState<FilterOperator>('is');
    const [cycleOperator, setCycleOperator] = useState<FilterOperator>('is');
    const [panelOpen, setPanelOpen] = useState(false);
    const [panelTab, setPanelTab] = useState<PanelTab>('assignees');
    const [draggedIssueId, setDraggedIssueId] = useState<number | null>(null);
    const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
    const draggedIssueIdRef = useRef<number | null>(null);
    const dropTargetRef = useRef<DropTarget | null>(null);
    const groupsRef = useRef<Group[]>([]);
    const issuesRef = useRef<Issue[]>(issues);
    const pointerDragRef = useRef<{ id: number; startX: number; startY: number; dragging: boolean } | null>(null);
    const suppressNextIssueClickRef = useRef(false);

    const favorites = useFavorites();
    const viewLabel = view === 'active' ? t('issues.title') : t(TABS.find((tab) => tab.view === view)!.labelKey);
    const viewHref = `/team/DEV/${view}`;
    const favorite = favorites.some((f) => f.href === viewHref);

    // Esc clears the selection, as in Linear.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelected(new Set());
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const [assigneeFilters, setAssigneeFilters] = useState<Set<string>>(new Set());
    const assignees = useMemo(() => [...new Set(issues.map((issue) => issue.assignee).filter(Boolean) as string[])], [issues]);

    const viewIssues = useMemo(() => issues.filter((i) => VIEW_STATUSES[view].includes(i.status)), [issues, view]);

    const visibleIssues = useMemo(() => {
        let result = viewIssues;
        const matchesOperator = (matches: boolean, operator: FilterOperator) => (operator === 'is' ? matches : !matches);

        if (statusFilters.size > 0) result = result.filter((i) => matchesOperator(statusFilters.has(i.status), statusOperator));
        if (priorityFilters.size > 0) result = result.filter((i) => matchesOperator(priorityFilters.has(i.priority), priorityOperator));
        if (assigneeFilters.size > 0) result = result.filter((i) => matchesOperator(assigneeFilters.has(i.assignee ?? '__none__'), assigneeOperator));
        if (labelFilters.size > 0)
            result = result.filter((i) =>
                matchesOperator(
                    i.labels.some((label) => labelFilters.has(label.id)),
                    labelOperator,
                ),
            );
        if (projectFilters.size > 0)
            result = result.filter((i) => matchesOperator(i.project_id !== null && projectFilters.has(i.project_id), projectOperator));
        if (cycleFilters.size > 0) result = result.filter((i) => matchesOperator(i.cycle_id !== null && cycleFilters.has(i.cycle_id), cycleOperator));
        return result;
    }, [
        viewIssues,
        statusFilters,
        statusOperator,
        priorityFilters,
        priorityOperator,
        assigneeFilters,
        assigneeOperator,
        labelFilters,
        labelOperator,
        projectFilters,
        projectOperator,
        cycleFilters,
        cycleOperator,
    ]);

    const orderedIssues = useMemo(() => {
        if (ordering === 'manual') return visibleIssues;

        return [...visibleIssues].sort((a, b) => {
            if (ordering === 'priority') return a.priority - b.priority || a.sort_order - b.sort_order;
            if (ordering === 'created') return a.number - b.number;
            if (ordering === 'updated') return b.number - a.number;

            return a.sort_order - b.sort_order;
        });
    }, [visibleIssues, ordering]);

    const groups: Group[] = useMemo(() => {
        if (grouping === 'priority') {
            return [1, 2, 3, 4, 0]
                .map((priority) => ({
                    key: `p-${priority}`,
                    label: priorityLabel(priority),
                    icon: <PriorityIcon priority={priority} className="size-4" />,
                    newIssueStatus: 'todo' as IssueStatus,
                    items: orderedIssues.filter((i) => i.priority === priority),
                }))
                .filter((g) => showEmptyGroups || draggedIssueId !== null || g.items.length > 0);
        }
        if (grouping === 'none') {
            return orderedIssues.length > 0
                ? [{ key: 'all', label: t('issues.tabs.all'), icon: null, newIssueStatus: 'todo' as IssueStatus, items: orderedIssues }]
                : [];
        }
        if (grouping === 'project') {
            return [
                ...projects.map((project) => ({
                    key: `project-${project.id}`,
                    label: project.name,
                    icon: <Box className="text-muted-foreground size-4" />,
                    newIssueStatus: 'todo' as IssueStatus,
                    items: orderedIssues.filter((i) => i.project_id === project.id),
                })),
                {
                    key: 'project-none',
                    label: t('issues.noProject'),
                    icon: <Box className="text-muted-foreground size-4" />,
                    newIssueStatus: 'todo' as IssueStatus,
                    items: orderedIssues.filter((i) => !i.project_id),
                },
            ].filter((g) => showEmptyGroups || draggedIssueId !== null || g.items.length > 0);
        }
        if (grouping === 'cycle') {
            return [
                ...cycles.map((cycle) => ({
                    key: `cycle-${cycle.id}`,
                    label: t('issues.cycleLabel', { number: cycle.number }),
                    icon: <Repeat2 className="text-muted-foreground size-4" />,
                    newIssueStatus: 'todo' as IssueStatus,
                    items: orderedIssues.filter((i) => i.cycle_id === cycle.id),
                })),
                {
                    key: 'cycle-none',
                    label: t('issues.noCycle'),
                    icon: <Repeat2 className="text-muted-foreground size-4" />,
                    newIssueStatus: 'todo' as IssueStatus,
                    items: orderedIssues.filter((i) => !i.cycle_id),
                },
            ].filter((g) => showEmptyGroups || draggedIssueId !== null || g.items.length > 0);
        }
        if (grouping === 'label') {
            return labels
                .map((label) => ({
                    key: `label-${label.id}`,
                    label: label.name,
                    icon: <span className="size-2.5 rounded-full" style={{ backgroundColor: label.color }} />,
                    newIssueStatus: 'todo' as IssueStatus,
                    items: orderedIssues.filter((i) => i.labels.some((issueLabel) => issueLabel.id === label.id)),
                }))
                .filter((g) => showEmptyGroups || g.items.length > 0);
        }
        return VIEW_STATUSES[view]
            .map((status) => ({
                key: status,
                label: statusLabel(status),
                icon: <StatusIcon status={status} />,
                newIssueStatus: status,
                items: orderedIssues.filter((i) => i.status === status),
            }))
            .filter((g) => showEmptyGroups || draggedIssueId !== null || g.items.length > 0);
    }, [orderedIssues, view, grouping, projects, cycles, labels, draggedIssueId, showEmptyGroups]);

    useEffect(() => {
        groupsRef.current = groups;
    }, [groups]);

    useEffect(() => {
        issuesRef.current = issues;
    }, [issues]);

    const toggleSelect = (id: number, checked: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const hasFilters =
        statusFilters.size > 0 ||
        priorityFilters.size > 0 ||
        assigneeFilters.size > 0 ||
        labelFilters.size > 0 ||
        projectFilters.size > 0 ||
        cycleFilters.size > 0;
    const hiddenIssueCount = Math.max(viewIssues.length - visibleIssues.length, 0);

    const toggleSetValue = <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, value: T) => {
        setter((prev) => {
            const next = new Set(prev);
            if (next.has(value)) next.delete(value);
            else next.add(value);
            return next;
        });
    };

    const addSetValue = <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, value: T) => {
        setter((prev) => {
            const next = new Set(prev);
            next.add(value);
            return next;
        });
    };

    const clearFilters = () => {
        setStatusFilters(new Set());
        setPriorityFilters(new Set());
        setAssigneeFilters(new Set());
        setLabelFilters(new Set());
        setProjectFilters(new Set());
        setCycleFilters(new Set());
        setStatusOperator('is');
        setPriorityOperator('is');
        setAssigneeOperator('is');
        setLabelOperator('is');
        setProjectOperator('is');
        setCycleOperator('is');
    };

    const toggleDisplayProperty = (property: IssueDisplayProperty) => {
        setDisplayProperties((prev) => {
            const next = new Set(prev);
            if (next.has(property)) next.delete(property);
            else next.add(property);
            return next;
        });
    };

    const addDefaultFilter = (type: FilterType) => {
        if (type === 'status') addSetValue<IssueStatus>(setStatusFilters, 'todo');
        if (type === 'priority') addSetValue<number>(setPriorityFilters, 0);
        if (type === 'assignee') addSetValue<string>(setAssigneeFilters, assignees[0] ?? '__none__');
        if (type === 'label' && labels[0]) addSetValue<number>(setLabelFilters, labels[0].id);
        if (type === 'project' && projects[0]) addSetValue<number>(setProjectFilters, projects[0].id);
        if (type === 'cycle' && cycles[0]) addSetValue<number>(setCycleFilters, cycles[0].id);
    };

    const replaceFilterType = (previousType: FilterType, removePrevious: () => void, nextType: FilterType) => {
        if (previousType === nextType) return;

        removePrevious();
        addDefaultFilter(nextType);
    };

    const filterFieldDefinitions: [FilterType, string, typeof CircleDot][] = [
        ['status', t('issues.field.status'), CircleDot],
        ['assignee', t('issues.field.assignee'), User],
        ['priority', t('issues.field.priority'), Flag],
        ['label', t('issues.field.labels'), Tag],
        ['project', t('issues.field.project'), Box],
        ['cycle', t('issues.field.projectProperties'), Repeat2],
    ];

    const filterFieldOptions = (currentType: FilterType, removeCurrent: () => void): FilterMenuOption[] =>
        filterFieldDefinitions.map(([type, label, Icon]) => ({
            key: type,
            label,
            icon: <Icon className="text-muted-foreground size-4" />,
            checked: currentType === type,
            onSelect: () => replaceFilterType(currentType, removeCurrent, type),
        }));

    const addFilterFieldOptions = (): FilterMenuOption[] =>
        filterFieldDefinitions.map(([type, label, Icon]) => ({
            key: type,
            label,
            icon: <Icon className="text-muted-foreground size-4" />,
            suffix: <ChevronRight className="text-muted-foreground size-3.5" />,
            onSelect: () => addDefaultFilter(type),
        }));

    const issueCountLabel = (count: number) => t('issues.count', { count });
    const valueSummary = (values: React.ReactNode[], emptyLabel: string) => {
        if (values.length === 0) return emptyLabel;
        if (values.length === 1) return values[0];

        return (
            <span className="flex min-w-0 items-center gap-1.5">
                <span className="min-w-0 truncate">{values[0]}</span>
                <span className="bg-accent text-muted-foreground shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium">
                    +{values.length - 1}
                </span>
            </span>
        );
    };

    const statusValues = STATUS_ORDER.filter((status) => statusFilters.has(status));
    const priorityValues = PRIORITY_META.filter((priority) => priorityFilters.has(priority.value));
    const assigneeValues = ['__none__', ...assignees].filter((assignee) => assigneeFilters.has(assignee));
    const labelValues = labels.filter((label) => labelFilters.has(label.id));
    const projectValues = projects.filter((project) => projectFilters.has(project.id));
    const cycleValues = cycles.filter((cycle) => cycleFilters.has(cycle.id));

    const activeFilterClauses = [
        statusFilters.size > 0 && {
            key: 'status',
            type: 'status',
            icon: <CircleDot className="size-4" />,
            label: t('issues.field.status'),
            operator: statusOperator,
            value: valueSummary(
                statusValues.map((status) => statusLabel(status)),
                t('issues.field.status'),
            ),
            valuePrefix: statusValues.length === 1 ? <StatusIcon status={statusValues[0]} /> : undefined,
            fieldOptions: filterFieldOptions('status', () => setStatusFilters(new Set())),
            valueOptions: STATUS_ORDER.map((candidate) => ({
                key: candidate,
                label: statusLabel(candidate),
                icon: <StatusIcon status={candidate} />,
                suffix: issueCountLabel(viewIssues.filter((issue) => issue.status === candidate).length),
                checked: statusFilters.has(candidate),
                keepOpen: true,
                onSelect: () => toggleSetValue(setStatusFilters, candidate),
            })),
            onOperatorChange: setStatusOperator,
            onRemove: () => setStatusFilters(new Set()),
        },
        priorityFilters.size > 0 && {
            key: 'priority',
            type: 'priority',
            icon: <Flag className="size-4" />,
            label: t('issues.field.priority'),
            operator: priorityOperator,
            value: valueSummary(
                priorityValues.map((priority) => priorityLabel(priority.value)),
                t('issues.field.priority'),
            ),
            valuePrefix: priorityValues.length === 1 ? <PriorityIcon priority={priorityValues[0].value} className="size-4" /> : undefined,
            fieldOptions: filterFieldOptions('priority', () => setPriorityFilters(new Set())),
            valueOptions: PRIORITY_META.map((candidate) => ({
                key: String(candidate.value),
                label: priorityLabel(candidate.value),
                icon: <PriorityIcon priority={candidate.value} className="size-4" />,
                suffix: issueCountLabel(viewIssues.filter((issue) => issue.priority === candidate.value).length),
                checked: priorityFilters.has(candidate.value),
                keepOpen: true,
                onSelect: () => toggleSetValue(setPriorityFilters, candidate.value),
            })),
            onOperatorChange: setPriorityOperator,
            onRemove: () => setPriorityFilters(new Set()),
        },
        assigneeFilters.size > 0 && {
            key: 'assignee',
            type: 'assignee',
            icon: <User className="size-4" />,
            label: t('issues.field.assignee'),
            operator: assigneeOperator,
            value: valueSummary(
                assigneeValues.map((assignee) => (assignee === '__none__' ? t('issues.noAssignee') : assignee)),
                t('issues.field.assignee'),
            ),
            valuePrefix:
                assigneeValues.length === 1 && assigneeValues[0] !== '__none__' ? (
                    <FilterValueAvatar label={assigneeValues[0]} color="#7C6CF4" />
                ) : undefined,
            fieldOptions: filterFieldOptions('assignee', () => setAssigneeFilters(new Set())),
            valueOptions: [
                {
                    key: '__none__',
                    label: t('issues.noAssignee'),
                    icon: <User className="text-muted-foreground size-4" />,
                    suffix: issueCountLabel(viewIssues.filter((issue) => !issue.assignee).length),
                    checked: assigneeFilters.has('__none__'),
                    keepOpen: true,
                    onSelect: () => toggleSetValue<string>(setAssigneeFilters, '__none__'),
                },
                ...assignees.map((candidate) => ({
                    key: candidate,
                    label: candidate,
                    icon: <FilterValueAvatar label={candidate} color="#7C6CF4" />,
                    suffix: issueCountLabel(viewIssues.filter((issue) => issue.assignee === candidate).length),
                    checked: assigneeFilters.has(candidate),
                    keepOpen: true,
                    onSelect: () => toggleSetValue(setAssigneeFilters, candidate),
                })),
            ],
            onOperatorChange: setAssigneeOperator,
            onRemove: () => setAssigneeFilters(new Set()),
        },
        labelFilters.size > 0 && {
            key: 'label',
            type: 'label',
            icon: <Tag className="size-4" />,
            label: t('issues.field.labels'),
            operator: labelOperator,
            value: valueSummary(
                labelValues.map((label) => label.name),
                t('issues.field.labels'),
            ),
            valuePrefix:
                labelValues.length === 1 ? <span className="size-2.5 rounded-full" style={{ backgroundColor: labelValues[0].color }} /> : undefined,
            fieldOptions: filterFieldOptions('label', () => setLabelFilters(new Set())),
            valueOptions: labels.map((candidate) => ({
                key: String(candidate.id),
                label: candidate.name,
                icon: <span className="size-2.5 rounded-full" style={{ backgroundColor: candidate.color }} />,
                suffix: issueCountLabel(viewIssues.filter((issue) => issue.labels.some((issueLabel) => issueLabel.id === candidate.id)).length),
                checked: labelFilters.has(candidate.id),
                keepOpen: true,
                onSelect: () => toggleSetValue(setLabelFilters, candidate.id),
            })),
            onOperatorChange: setLabelOperator,
            onRemove: () => setLabelFilters(new Set()),
        },
        projectFilters.size > 0 && {
            key: 'project',
            type: 'project',
            icon: <Box className="size-4" />,
            label: t('issues.field.project'),
            operator: projectOperator,
            value: valueSummary(
                projectValues.map((project) => project.name),
                t('issues.field.project'),
            ),
            valuePrefix:
                projectValues.length === 1 ? (
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: projectValues[0].color }} />
                ) : undefined,
            fieldOptions: filterFieldOptions('project', () => setProjectFilters(new Set())),
            valueOptions: projects.map((candidate) => ({
                key: String(candidate.id),
                label: candidate.name,
                icon: <span className="size-2.5 rounded-full" style={{ backgroundColor: candidate.color }} />,
                suffix: issueCountLabel(viewIssues.filter((issue) => issue.project_id === candidate.id).length),
                checked: projectFilters.has(candidate.id),
                keepOpen: true,
                onSelect: () => toggleSetValue(setProjectFilters, candidate.id),
            })),
            onOperatorChange: setProjectOperator,
            onRemove: () => setProjectFilters(new Set()),
        },
        cycleFilters.size > 0 && {
            key: 'cycle',
            type: 'cycle',
            icon: <Repeat2 className="size-4" />,
            label: t('issues.field.cycle'),
            operator: cycleOperator,
            value: valueSummary(
                cycleValues.map((cycle) => t('issues.cycleLabel', { number: cycle.number })),
                t('issues.field.cycle'),
            ),
            fieldOptions: filterFieldOptions('cycle', () => setCycleFilters(new Set())),
            valueOptions: cycles.map((candidate) => ({
                key: String(candidate.id),
                label: t('issues.cycleLabel', { number: candidate.number }),
                icon: <Repeat2 className="text-muted-foreground size-4" />,
                suffix: issueCountLabel(viewIssues.filter((issue) => issue.cycle_id === candidate.id).length),
                checked: cycleFilters.has(candidate.id),
                keepOpen: true,
                onSelect: () => toggleSetValue(setCycleFilters, candidate.id),
            })),
            onOperatorChange: setCycleOperator,
            onRemove: () => setCycleFilters(new Set()),
        },
    ].filter(Boolean) as ActiveFilterClauseData[];

    const groupingLabel = t(`grouping.${grouping}`);
    const subGroupingLabel = t(`grouping.${subGrouping}`);
    const orderingLabel = t(`ordering.${ordering}`);

    const draggedIssue = draggedIssueId ? (issues.find((issue) => issue.id === draggedIssueId) ?? null) : null;
    const canDropIssues = grouping !== 'label';

    const getDraggedIssue = () => {
        const id = draggedIssueIdRef.current ?? draggedIssueId;
        return id ? (issues.find((issue) => issue.id === id) ?? null) : null;
    };

    const groupDropData = (group: Group, issue: Issue) => {
        if (grouping === 'status') {
            return issue.status === group.newIssueStatus ? {} : { status: group.newIssueStatus };
        }

        if (grouping === 'priority') {
            const priority = Number(group.key.replace('p-', ''));
            if (Number.isNaN(priority)) return null;

            return issue.priority === priority ? {} : { priority };
        }

        if (grouping === 'project') {
            if (group.key === 'project-none') return issue.project_id === null ? {} : { project_id: null };

            const projectId = Number(group.key.replace('project-', ''));
            if (Number.isNaN(projectId)) return null;

            return issue.project_id === projectId ? {} : { project_id: projectId };
        }

        if (grouping === 'cycle') {
            if (group.key === 'cycle-none') return issue.cycle_id === null ? {} : { cycle_id: null };

            const cycleId = Number(group.key.replace('cycle-', ''));
            if (Number.isNaN(cycleId)) return null;

            return issue.cycle_id === cycleId ? {} : { cycle_id: cycleId };
        }

        if (grouping === 'none') {
            return {};
        }

        return null;
    };

    const canDropOnGroup = (group: Group, issue: Issue | null) => canDropIssues && Boolean(issue) && groupDropData(group, issue as Issue) !== null;

    const updateDropTarget = (target: DropTarget | null) => {
        dropTargetRef.current = target;
        setDropTarget(target);
    };

    const setDragSelectionLock = (locked: boolean) => {
        document.documentElement.classList.toggle('linear-dnd-active', locked);
        if (locked) window.getSelection()?.removeAllRanges();
    };

    const startIssueDrag = (event: DragEvent<HTMLDivElement>, issue: Issue) => {
        draggedIssueIdRef.current = issue.id;
        setDraggedIssueId(issue.id);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(issue.id));
        }
    };

    const clearIssueDrag = () => {
        draggedIssueIdRef.current = null;
        setDraggedIssueId(null);
        updateDropTarget(null);
        pointerDragRef.current = null;
        setDragSelectionLock(false);
    };

    const allowGroupDrop = (event: DragEvent<HTMLElement>, group: Group) => {
        const issue = getDraggedIssue();

        if (!canDropOnGroup(group, issue)) return;

        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        updateDropTarget({ groupKey: group.key, issueId: null, position: 'end' });
    };

    const allowIssueDrop = (event: DragEvent<HTMLDivElement>, group: Group, targetIssue: Issue) => {
        const issue = getDraggedIssue();

        if (!canDropOnGroup(group, issue) || issue?.id === targetIssue.id) return;

        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

        const bounds = event.currentTarget.getBoundingClientRect();
        const position = event.clientY < bounds.top + bounds.height / 2 ? 'before' : 'after';
        updateDropTarget({ groupKey: group.key, issueId: targetIssue.id, position });
    };

    const reorderIssueInGroup = (group: Group, issue: Issue, target: DropTarget) => {
        const data = groupDropData(group, issue);

        if (data === null) return;

        const items = group.items.filter((item) => item.id !== issue.id);
        let insertIndex = items.length;

        if (target.issueId !== null) {
            const targetIndex = items.findIndex((item) => item.id === target.issueId);

            if (targetIndex >= 0) {
                insertIndex = target.position === 'after' ? targetIndex + 1 : targetIndex;
            }
        }

        const orderedIds = [...items.slice(0, insertIndex), issue, ...items.slice(insertIndex)].map((item) => item.id);
        const currentIds = group.items.map((item) => item.id);
        const onlyReordered = Object.keys(data).length === 0;
        const unchanged = currentIds.length === orderedIds.length && currentIds.every((id, index) => id === orderedIds[index]);

        if (onlyReordered && unchanged) return;

        router.patch(
            '/issues-reorder',
            { ids: orderedIds, ...data },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => toast.success({ title: onlyReordered ? t('issues.toast.reordered') : t('issues.toast.moved') }),
                onError: () => toast.error({ title: t('issues.toast.reorderFailed') }),
            },
        );
    };

    const finishTrackedIssueDrag = (event?: { preventDefault: () => void }) => {
        const drag = pointerDragRef.current;
        const target = dropTargetRef.current;
        const dragged = drag ? (issuesRef.current.find((candidate) => candidate.id === drag.id) ?? null) : null;
        const group = target ? (groupsRef.current.find((candidate) => candidate.key === target.groupKey) ?? null) : null;

        if (drag?.dragging) {
            event?.preventDefault();

            if (dragged && group && target) {
                reorderIssueInGroup(group, dragged, target);
            }

            window.setTimeout(() => {
                suppressNextIssueClickRef.current = false;
            }, 250);
        }

        clearIssueDrag();
    };

    const updatePointerDropTarget = (clientX: number, clientY: number) => {
        const issue = getDraggedIssue();
        const element = document.elementFromPoint(clientX, clientY);
        const groupElement = element?.closest<HTMLElement>('[data-issue-group-key]');
        const groupKey = groupElement?.dataset.issueGroupKey;
        const group = groupKey ? groupsRef.current.find((candidate) => candidate.key === groupKey) : null;

        if (!groupElement || !group || !canDropOnGroup(group, issue)) {
            updateDropTarget(null);
            return;
        }

        const rowElements = [...groupElement.querySelectorAll<HTMLElement>('[data-issue-row-id]')].filter(
            (row) => Number(row.dataset.issueRowId) !== issue?.id,
        );
        const lastRowBounds = rowElements.at(-1)?.getBoundingClientRect();
        const rowElement =
            lastRowBounds && clientY > lastRowBounds.bottom
                ? null
                : rowElements.reduce<HTMLElement | null>((nearest, row) => {
                      if (!nearest) return row;

                      const bounds = row.getBoundingClientRect();
                      const nearestBounds = nearest.getBoundingClientRect();
                      const distance = Math.abs(clientY - (bounds.top + bounds.height / 2));
                      const nearestDistance = Math.abs(clientY - (nearestBounds.top + nearestBounds.height / 2));

                      return distance < nearestDistance ? row : nearest;
                  }, null);
        const targetIssueId = rowElement ? Number(rowElement.dataset.issueRowId) : null;

        if (rowElement && targetIssueId && group.items.some((item) => item.id === targetIssueId)) {
            const bounds = rowElement.getBoundingClientRect();
            updateDropTarget({
                groupKey: group.key,
                issueId: targetIssueId,
                position: clientY < bounds.top + bounds.height / 2 ? 'before' : 'after',
            });
            return;
        }

        updateDropTarget({ groupKey: group.key, issueId: null, position: 'end' });
    };

    const startPointerIssueDrag = (event: PointerEvent<HTMLDivElement>, issue: Issue) => {
        if (!canDropIssues || event.button !== 0 || isInteractiveDragTarget(event.target)) return;

        pointerDragRef.current = {
            id: issue.id,
            startX: event.clientX,
            startY: event.clientY,
            dragging: false,
        };

        const onPointerMove = (moveEvent: NativePointerEvent) => {
            const drag = pointerDragRef.current;
            if (!drag || drag.id !== issue.id) return;

            const distance = Math.hypot(moveEvent.clientX - drag.startX, moveEvent.clientY - drag.startY);

            if (!drag.dragging && distance < 4) return;

            if (!drag.dragging) {
                drag.dragging = true;
                suppressNextIssueClickRef.current = true;
                draggedIssueIdRef.current = issue.id;
                setDraggedIssueId(issue.id);
                setDragSelectionLock(true);
            }

            moveEvent.preventDefault();
            updatePointerDropTarget(moveEvent.clientX, moveEvent.clientY);
        };

        const onPointerUp = (upEvent: NativePointerEvent) => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);

            finishTrackedIssueDrag(upEvent);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    };

    const startMouseIssueDrag = (event: MouseEvent<HTMLDivElement>, issue: Issue) => {
        if (!canDropIssues || event.button !== 0 || isInteractiveDragTarget(event.target)) return;
        if (pointerDragRef.current && pointerDragRef.current.id !== issue.id) return;

        pointerDragRef.current ??= {
            id: issue.id,
            startX: event.clientX,
            startY: event.clientY,
            dragging: false,
        };

        const onMouseMove = (moveEvent: NativeMouseEvent) => {
            const drag = pointerDragRef.current;
            if (!drag || drag.id !== issue.id) return;

            const distance = Math.hypot(moveEvent.clientX - drag.startX, moveEvent.clientY - drag.startY);

            if (!drag.dragging && distance < 4) return;

            if (!drag.dragging) {
                drag.dragging = true;
                suppressNextIssueClickRef.current = true;
                draggedIssueIdRef.current = issue.id;
                setDraggedIssueId(issue.id);
                setDragSelectionLock(true);
            }

            moveEvent.preventDefault();
            updatePointerDropTarget(moveEvent.clientX, moveEvent.clientY);
        };

        const onMouseUp = (upEvent: NativeMouseEvent) => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            finishTrackedIssueDrag(upEvent);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleIssueClick = (event: MouseEvent<HTMLDivElement>) => {
        if (!suppressNextIssueClickRef.current) return;

        event.preventDefault();
        event.stopPropagation();
        suppressNextIssueClickRef.current = false;

        return false;
    };

    const dropIssueOnGroup = (event: DragEvent<HTMLElement>, group: Group) => {
        event.preventDefault();
        event.stopPropagation();
        const issue = getDraggedIssue();

        if (!canDropOnGroup(group, issue) || !issue) {
            clearIssueDrag();
            return;
        }

        reorderIssueInGroup(group, issue, { groupKey: group.key, issueId: null, position: 'end' });
        clearIssueDrag();
    };

    const dropIssueOnIssue = (event: DragEvent<HTMLDivElement>, group: Group, targetIssue: Issue) => {
        event.preventDefault();
        event.stopPropagation();
        const issue = getDraggedIssue();

        if (canDropOnGroup(group, issue) && issue && issue.id !== targetIssue.id) {
            const target =
                dropTarget?.groupKey === group.key && dropTarget.issueId === targetIssue.id
                    ? dropTarget
                    : ({ groupKey: group.key, issueId: targetIssue.id, position: 'before' } satisfies DropTarget);

            reorderIssueInGroup(group, issue, target);
        }

        clearIssueDrag();
    };

    return (
        <>
            <Head title={t('issues.title')} />
            <PageHeader
                left={
                    <>
                        <TeamBadge />
                        <span className="text-foreground font-medium">Devaubree</span>
                        <ChevronRight className="text-muted-foreground/60 size-3.5" />
                        <span className="text-foreground">{t('header.issues')}</span>
                        <HeaderIconButton
                            label={t('header.favoriteView')}
                            onClick={() => toggleFavorite({ label: viewLabel, href: viewHref })}
                            active={favorite}
                        >
                            <Star className={cn('size-3.5', favorite && 'fill-yellow-400')} />
                        </HeaderIconButton>
                    </>
                }
            />

            {/* View tabs + filter / display controls */}
            <div className="flex h-11 shrink-0 items-center justify-between px-2.5">
                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-2">
                        {TABS.map((tab) => (
                            <Link
                                key={tab.view}
                                href={`/team/DEV/${tab.view}`}
                                preserveState
                                preserveScroll
                                className={cn(
                                    'flex h-7 items-center rounded-full px-2.5 text-xs font-medium transition-colors duration-100',
                                    view === tab.view ? 'bg-accent text-foreground' : 'bg-muted text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {t(tab.labelKey)}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-0.5">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <LinearToolbarButton label={t('issues.filter')} active={hasFilters}>
                                <ListFilter className="size-4" />
                            </LinearToolbarButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            sideOffset={6}
                            onCloseAutoFocus={(event) => {
                                event.preventDefault();
                                if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                            }}
                            className="border-border/80 bg-popover/95 w-[216px] rounded-xl p-1.5 shadow-2xl"
                        >
                            <DropdownMenuItem className="text-muted-foreground h-8 rounded-lg text-[13px]" disabled>
                                {t('issues.addFilter')}
                                <DropdownMenuShortcut className="bg-muted ml-auto rounded px-1.5 py-0.5 text-[10px] tracking-normal">
                                    F
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="h-8 gap-2 rounded-lg text-[13px]" disabled>
                                <Sparkles className="text-muted-foreground size-4" />
                                {t('issues.aiFilter')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="h-8 gap-2 rounded-lg text-[13px]" disabled>
                                <ListFilter className="text-muted-foreground size-4" />
                                {t('issues.advancedFilter')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="-mx-1.5 my-1.5" />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 gap-2 rounded-lg text-[13px]">
                                    <CircleDot className="text-muted-foreground size-4" />
                                    {t('issues.field.status')}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="border-border/80 bg-popover/95 w-48 rounded-xl p-1.5 shadow-2xl">
                                    {STATUS_ORDER.map((status) => (
                                        <DropdownMenuItem
                                            key={status}
                                            className="h-8 gap-2 rounded-lg text-[13px]"
                                            onSelect={() => toggleSetValue(setStatusFilters, status)}
                                        >
                                            <StatusIcon status={status} />
                                            {statusLabel(status)}
                                            {statusFilters.has(status) && <Check className="ml-auto size-3.5" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 gap-2 rounded-lg text-[13px]">
                                    <User className="text-muted-foreground size-4" />
                                    {t('issues.field.assignee')}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="border-border/80 bg-popover/95 w-48 rounded-xl p-1.5 shadow-2xl">
                                    <DropdownMenuItem
                                        className="h-8 gap-2 rounded-lg text-[13px]"
                                        onSelect={() => toggleSetValue(setAssigneeFilters, '__none__' as string)}
                                    >
                                        <User className="text-muted-foreground size-4" />
                                        {t('issues.noAssignee')}
                                        {assigneeFilters.has('__none__') && <Check className="ml-auto size-3.5" />}
                                    </DropdownMenuItem>
                                    {assignees.map((assignee) => (
                                        <DropdownMenuItem
                                            key={assignee}
                                            className="h-8 gap-2 rounded-lg text-[13px]"
                                            onSelect={() => toggleSetValue(setAssigneeFilters, assignee)}
                                        >
                                            <User className="text-muted-foreground size-4" />
                                            {assignee}
                                            {assigneeFilters.has(assignee) && <Check className="ml-auto size-3.5" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 gap-2 rounded-lg text-[13px]" disabled>
                                    <Bot className="text-muted-foreground size-4" />
                                    {t('issues.field.agent')}
                                </DropdownMenuSubTrigger>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 gap-2 rounded-lg text-[13px]" disabled>
                                    <Bot className="text-muted-foreground size-4" />
                                    {t('issues.field.agentSession')}
                                </DropdownMenuSubTrigger>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 gap-2 rounded-lg text-[13px]" disabled>
                                    <User className="text-muted-foreground size-4" />
                                    {t('issues.field.creator')}
                                </DropdownMenuSubTrigger>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 gap-2 rounded-lg text-[13px]">
                                    <Flag className="text-muted-foreground size-4" />
                                    {t('issues.field.priority')}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="border-border/80 bg-popover/95 w-48 rounded-xl p-1.5 shadow-2xl">
                                    {PRIORITY_META.map((p) => (
                                        <DropdownMenuItem
                                            key={p.value}
                                            className="h-8 gap-2 rounded-lg text-[13px]"
                                            onSelect={() => toggleSetValue(setPriorityFilters, p.value)}
                                        >
                                            <PriorityIcon priority={p.value} className="size-4" />
                                            {priorityLabel(p.value)}
                                            {priorityFilters.has(p.value) && <Check className="ml-auto size-3.5" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 gap-2 rounded-lg text-[13px]" disabled={labels.length === 0}>
                                    <Tag className="text-muted-foreground size-4" />
                                    {t('issues.field.labels')}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="border-border/80 bg-popover/95 w-52 rounded-xl p-1.5 shadow-2xl">
                                    {labels.map((label) => (
                                        <DropdownMenuItem
                                            key={label.id}
                                            className="h-8 gap-2 rounded-lg text-[13px]"
                                            onSelect={() => toggleSetValue(setLabelFilters, label.id)}
                                        >
                                            <span className="size-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                                            {label.name}
                                            {labelFilters.has(label.id) && <Check className="ml-auto size-3.5" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 gap-2 rounded-lg text-[13px]" disabled>
                                    <GitBranch className="text-muted-foreground size-4" />
                                    {t('issues.field.relations')}
                                </DropdownMenuSubTrigger>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 gap-2 rounded-lg text-[13px]" disabled>
                                    <Tag className="text-muted-foreground size-4" />
                                    {t('issues.field.suggestedLabel')}
                                </DropdownMenuSubTrigger>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 gap-2 rounded-lg text-[13px]" disabled>
                                    <CalendarDays className="text-muted-foreground size-4" />
                                    {t('issues.field.dates')}
                                </DropdownMenuSubTrigger>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator className="-mx-1.5 my-1.5" />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 gap-2 rounded-lg text-[13px]" disabled={projects.length === 0}>
                                    <Box className="text-muted-foreground size-4" />
                                    {t('issues.field.project')}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="border-border/80 bg-popover/95 w-56 rounded-xl p-1.5 shadow-2xl">
                                    {projects.map((project) => (
                                        <DropdownMenuItem
                                            key={project.id}
                                            className="h-8 gap-2 rounded-lg text-[13px]"
                                            onSelect={() => toggleSetValue(setProjectFilters, project.id)}
                                        >
                                            <span className="size-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                                            {project.name}
                                            {projectFilters.has(project.id) && <Check className="ml-auto size-3.5" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 gap-2 rounded-lg text-[13px]" disabled={cycles.length === 0}>
                                    <Repeat2 className="text-muted-foreground size-4" />
                                    {t('issues.field.projectProperties')}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="border-border/80 bg-popover/95 w-48 rounded-xl p-1.5 shadow-2xl">
                                    {cycles.map((cycle) => (
                                        <DropdownMenuItem
                                            key={cycle.id}
                                            className="h-8 gap-2 rounded-lg text-[13px]"
                                            onSelect={() => toggleSetValue(setCycleFilters, cycle.id)}
                                        >
                                            <Repeat2 className="text-muted-foreground size-4" />
                                            {t('issues.cycleLabel', { number: cycle.number })}
                                            {cycleFilters.has(cycle.id) && <Check className="ml-auto size-3.5" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator className="-mx-1.5 my-1.5" />
                            {[
                                ['subscribers', Bell],
                                ['autoClosed', CircleOff],
                                ['content', Type],
                                ['links', Link2],
                                ['template', FileText],
                            ].map(([key, Icon]) => (
                                <DropdownMenuSub key={key as string}>
                                    <DropdownMenuSubTrigger className="h-8 gap-2 rounded-lg text-[13px]" disabled>
                                        <Icon className="text-muted-foreground size-4" />
                                        {t(`issues.field.${key as string}`)}
                                    </DropdownMenuSubTrigger>
                                </DropdownMenuSub>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <LinearToolbarButton label={t('issues.displayOptions')} active={layout !== 'list' || grouping !== 'status' || ordering !== 'manual'}>
                                <SlidersHorizontal className="size-4" />
                            </LinearToolbarButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            sideOffset={6}
                            onCloseAutoFocus={(event) => {
                                event.preventDefault();
                                if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                            }}
                            className="border-border/80 bg-popover/95 w-[312px] rounded-xl p-3 shadow-2xl"
                        >
                            <div className="bg-muted/60 mb-4 grid h-8 grid-cols-2 gap-1 rounded-full p-0.5">
                                <button
                                    type="button"
                                    data-active={layout === 'list' || undefined}
                                    onClick={() => setLayout('list')}
                                    className="text-muted-foreground data-[active]:bg-accent data-[active]:text-foreground hover:text-foreground flex items-center justify-center gap-1.5 rounded-full text-[13px] font-medium transition-colors"
                                >
                                    <List className="size-3.5" />
                                    {t('issues.display.list')}
                                </button>
                                <button
                                    type="button"
                                    data-active={layout === 'board' || undefined}
                                    onClick={() => setLayout('board')}
                                    className="text-muted-foreground data-[active]:bg-accent data-[active]:text-foreground hover:text-foreground flex items-center justify-center gap-1.5 rounded-full text-[13px] font-medium transition-colors"
                                >
                                    <LayoutGrid className="size-3.5" />
                                    {t('issues.display.board')}
                                </button>
                            </div>
                            <DropdownMenuRadioGroup value={grouping} onValueChange={(v) => setGrouping(v as Grouping)}>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="h-8 rounded-lg px-0 text-[13px]">
                                        <ListFilter className="text-muted-foreground size-4" />
                                        {t('issues.display.grouping')}
                                        <span className="bg-accent text-foreground ml-auto rounded-md px-2 py-0.5 text-xs">{groupingLabel}</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="border-border/80 bg-popover/95 w-48 rounded-xl p-1.5 shadow-2xl">
                                        {(['status', 'priority', 'project', 'cycle', 'label', 'none'] as Grouping[]).map((value) => (
                                            <DropdownMenuRadioItem key={value} value={value} className="h-8 rounded-lg text-[13px]">
                                                {t(`grouping.${value}`)}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 rounded-lg px-0 text-[13px]">
                                    <ListFilter className="text-muted-foreground size-4" />
                                    {t('issues.display.subGrouping')}
                                    <span className="bg-accent text-foreground ml-auto rounded-md px-2 py-0.5 text-xs">{subGroupingLabel}</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="border-border/80 bg-popover/95 w-48 rounded-xl p-1.5 shadow-2xl">
                                    <DropdownMenuRadioGroup value={subGrouping} onValueChange={(value) => setSubGrouping(value as Grouping)}>
                                        {(['none', 'status', 'priority', 'project', 'cycle', 'label'] as Grouping[]).map((value) => (
                                            <DropdownMenuRadioItem key={value} value={value} className="h-8 rounded-lg text-[13px]">
                                                {t(`grouping.${value}`)}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="h-8 rounded-lg px-0 text-[13px]">
                                    <Flag className="text-muted-foreground size-4" />
                                    {t('issues.display.ordering')}
                                    <span className="bg-accent text-foreground ml-auto rounded-md px-2 py-0.5 text-xs">{orderingLabel}</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="border-border/80 bg-popover/95 w-44 rounded-xl p-1.5 shadow-2xl">
                                    <DropdownMenuRadioGroup value={ordering} onValueChange={(value) => setOrdering(value as Ordering)}>
                                        {(['manual', 'priority', 'created', 'updated'] as Ordering[]).map((value) => (
                                            <DropdownMenuRadioItem key={value} value={value} className="h-8 rounded-lg text-[13px]">
                                                {t(`ordering.${value}`)}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem
                                className="h-8 rounded-lg px-0 text-[13px]"
                                onSelect={(event) => {
                                    event.preventDefault();
                                    setShowSubIssues((value) => !value);
                                }}
                            >
                                {t('issues.display.showSubIssues')}
                                <LinearSwitch checked={showSubIssues} />
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="-mx-3 my-2" />
                            <DropdownMenuLabel className="text-foreground px-0 py-1 text-[13px] font-medium">{t('issues.display.listOptions')}</DropdownMenuLabel>
                            <DropdownMenuItem
                                className="h-8 rounded-lg px-0 text-[13px]"
                                onSelect={(event) => {
                                    event.preventDefault();
                                    setNestedSubIssues((value) => !value);
                                }}
                            >
                                {t('issues.display.nestedSubIssues')}
                                <LinearSwitch checked={nestedSubIssues} />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="h-8 rounded-lg px-0 text-[13px]"
                                onSelect={(event) => {
                                    event.preventDefault();
                                    setShowEmptyGroups((value) => !value);
                                }}
                            >
                                {t('issues.display.showEmptyGroups')}
                                <LinearSwitch checked={showEmptyGroups} />
                            </DropdownMenuItem>
                            <DropdownMenuLabel className="text-muted-foreground px-0 pt-2 pb-1 text-[13px] font-medium">
                                {t('issues.display.displayProperties')}
                            </DropdownMenuLabel>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    'id',
                                    'status',
                                    'assignee',
                                    'priority',
                                    'project',
                                    'due_date',
                                    'milestone',
                                    'labels',
                                    'links',
                                    'time',
                                    'created',
                                    'updated',
                                ].map((property) => (
                                    <DisplayChip
                                        key={property}
                                        active={displayProperties.has(property as IssueDisplayProperty)}
                                        onClick={() => toggleDisplayProperty(property as IssueDisplayProperty)}
                                    >
                                        {t(`issues.property.${property}`)}
                                    </DisplayChip>
                                ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button
                        aria-label={panelOpen ? t('issues.closeDetails') : t('issues.openDetails')}
                        onClick={() => setPanelOpen((v) => !v)}
                        data-open={panelOpen || undefined}
                        className="text-muted-foreground hover:bg-accent hover:text-foreground data-[open]:bg-accent data-[open]:text-foreground flex size-7 items-center justify-center rounded-full transition-colors duration-100"
                    >
                        <PanelToggleIcon className="size-4" />
                    </button>
                </div>
            </div>

            {/* Active filter builder */}
            {hasFilters && (
                <div className="px-3 pb-2">
                    <div className="bg-secondary/45 border-border/70 flex min-h-12 items-center gap-2 rounded-lg border px-3 py-2">
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                            {activeFilterClauses.map((clause) => (
                                <ActiveFilterClause
                                    key={clause.key}
                                    fieldOptions={clause.fieldOptions}
                                    icon={clause.icon}
                                    label={clause.label}
                                    operator={clause.operator}
                                    value={clause.value}
                                    valuePrefix={clause.valuePrefix}
                                    valueOptions={clause.valueOptions}
                                    onOperatorChange={clause.onOperatorChange}
                                    onRemove={clause.onRemove}
                                />
                            ))}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label={t('issues.addAnotherFilter')}
                                        className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    sideOffset={6}
                                    className="border-border/80 bg-popover/95 w-[216px] rounded-xl p-1.5 shadow-2xl"
                                >
                                    <SearchableFilterOptions
                                        placeholder={t('issues.addFilter')}
                                        options={[
                                            {
                                                key: 'ai-filter',
                                                label: t('issues.aiFilter'),
                                                icon: <Sparkles className="text-muted-foreground size-4" />,
                                                disabled: true,
                                            },
                                            ...addFilterFieldOptions(),
                                        ]}
                                    />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-muted-foreground hover:text-foreground h-8 shrink-0 rounded-md px-2.5 text-[13px] font-medium transition-colors"
                        >
                            {t('common.clear')}
                        </button>
                        <button
                            type="button"
                            className="border-border bg-accent/70 text-foreground hover:bg-accent h-8 shrink-0 rounded-full border px-3 text-[13px] font-medium transition-colors"
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </div>
            )}

            {/* Grouped issue list + facets panel */}
            <div className="relative flex flex-1 overflow-hidden">
                <div
                    className={cn(
                        'flex-1 pb-10',
                        layout === 'board' ? 'flex gap-3 overflow-x-auto overflow-y-hidden p-2' : 'overflow-y-auto',
                        groups.length === 0 && 'flex',
                    )}
                >
                    {groups.map((group) => {
                        const dropActive = dropTarget?.groupKey === group.key;
                        const dropEnabled = canDropOnGroup(group, draggedIssue);

                        return (
                            <section
                                key={group.key}
                                data-issue-group-key={group.key}
                                onDragOver={(event) => allowGroupDrop(event, group)}
                                onDragEnter={(event) => allowGroupDrop(event, group)}
                                onDragLeave={(event) => {
                                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) updateDropTarget(null);
                                }}
                                onDrop={(event) => dropIssueOnGroup(event, group)}
                                onPointerUpCapture={finishTrackedIssueDrag}
                                onMouseUpCapture={finishTrackedIssueDrag}
                                data-drop-active={dropActive || undefined}
                                data-drop-enabled={dropEnabled || undefined}
                                className={cn(
                                    'data-[drop-active]:bg-primary/10 rounded-lg transition-colors',
                                    layout === 'board' && 'bg-secondary/20 flex h-full min-w-[320px] flex-col border border-transparent',
                                )}
                            >
                                <div
                                    data-drop-active={dropActive || undefined}
                                    data-drop-enabled={dropEnabled || undefined}
                                    className="bg-secondary data-[drop-active]:ring-primary/60 data-[drop-enabled]:ring-border/80 mx-2 flex h-9 items-center gap-2 rounded-lg pr-2 pl-2.5 data-[drop-active]:ring-1 data-[drop-enabled]:ring-1"
                                >
                                    <ChevronDown className="text-muted-foreground/60 size-3" />
                                    {group.icon}
                                    <span className="text-foreground text-[13px] font-medium">{group.label}</span>
                                    <span className="text-muted-foreground text-[13px]">{group.items.length}</span>
                                    <span className="flex-1" />
                                    <button
                                        aria-label={t('issues.newIssue', { group: group.label })}
                                        onClick={() => openNewIssue(group.newIssueStatus)}
                                        className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-6 items-center justify-center rounded transition-colors duration-100"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <div
                                    className={cn(
                                        'flex min-h-3 flex-col gap-2 py-1.5 transition-colors',
                                        dropActive && group.items.length === 0 && 'border-primary/50 mx-2 min-h-10 rounded-md border border-dashed',
                                    )}
                                >
                                    {group.items.map((issue) => (
                                        <IssueRow
                                            key={issue.id}
                                            issue={issue}
                                            selected={selected.has(issue.id)}
                                            onSelect={toggleSelect}
                                            draggable={canDropIssues}
                                            dragging={draggedIssueId === issue.id}
                                            dropPosition={
                                                dropTarget?.groupKey === group.key && dropTarget.issueId === issue.id && dropTarget.position !== 'end'
                                                    ? dropTarget.position
                                                    : null
                                            }
                                            onDragStart={startIssueDrag}
                                            onDragOver={(event, targetIssue) => allowIssueDrop(event, group, targetIssue)}
                                            onDrop={(event, targetIssue) => dropIssueOnIssue(event, group, targetIssue)}
                                            onDragEnd={clearIssueDrag}
                                            onPointerDown={startPointerIssueDrag}
                                            onPointerUp={finishTrackedIssueDrag}
                                            onMouseDown={startMouseIssueDrag}
                                            onMouseUp={finishTrackedIssueDrag}
                                            onIssueClick={handleIssueClick}
                                            visibleProperties={displayProperties}
                                        />
                                    ))}
                                    {dropTarget?.groupKey === group.key && dropTarget.issueId === null && group.items.length > 0 && (
                                        <span className="bg-primary mx-4 h-px shrink-0" />
                                    )}
                                </div>
                            </section>
                        );
                    })}
                    {groups.length === 0 && (
                        <div className="text-muted-foreground flex min-h-[520px] flex-1 flex-col items-center justify-center text-center">
                            <FilterEmptyIllustration />
                            <p className="text-foreground/80 text-lg font-semibold">{t('issues.emptyState')}</p>
                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-muted-foreground hover:text-foreground mt-3 h-7 rounded-md px-2.5 text-[13px] transition-colors"
                                >
                                    {t('issues.clearFilters')}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {hasFilters && hiddenIssueCount > 0 && (
                    <div className="pointer-events-none absolute right-4 bottom-6 left-4 z-10 flex justify-center">
                        <div className="border-border bg-popover/95 pointer-events-auto flex h-12 min-w-[330px] items-center justify-between rounded-md border px-4 shadow-2xl">
                            <span className="text-foreground text-[13px] font-semibold">
                                {issueCountLabel(hiddenIssueCount)}{' '}
                                <span className="text-muted-foreground font-normal">{t('issues.hiddenByFilters')}</span>
                            </span>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="text-foreground hover:bg-accent flex h-7 items-center gap-2 rounded-md px-2.5 text-[13px] font-medium transition-colors"
                            >
                                {t('issues.clearFilters')}
                                <X className="text-muted-foreground size-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {panelOpen && (
                    <FacetsPanel
                        issues={viewIssues}
                        tab={panelTab}
                        onTabChange={setPanelTab}
                        assigneeFilters={assigneeFilters}
                        onToggleAssignee={(key) =>
                            setAssigneeFilters((prev) => {
                                const next = new Set(prev);
                                if (next.has(key)) next.delete(key);
                                else next.add(key);
                                return next;
                            })
                        }
                        priorityFilters={priorityFilters}
                        onTogglePriority={(value) =>
                            setPriorityFilters((prev) => {
                                const next = new Set(prev);
                                if (next.has(value)) next.delete(value);
                                else next.add(value);
                                return next;
                            })
                        }
                        labelFilters={labelFilters}
                        onToggleLabel={(value) =>
                            setLabelFilters((prev) => {
                                const next = new Set(prev);
                                if (next.has(value)) next.delete(value);
                                else next.add(value);
                                return next;
                            })
                        }
                        projectFilters={projectFilters}
                        onToggleProject={(value) =>
                            setProjectFilters((prev) => {
                                const next = new Set(prev);
                                if (next.has(value)) next.delete(value);
                                else next.add(value);
                                return next;
                            })
                        }
                        cycleFilters={cycleFilters}
                        onToggleCycle={(value) =>
                            setCycleFilters((prev) => {
                                const next = new Set(prev);
                                if (next.has(value)) next.delete(value);
                                else next.add(value);
                                return next;
                            })
                        }
                        metadata={{ labels, projects, cycles }}
                    />
                )}
            </div>

            <BulkBar ids={[...selected]} onClear={() => setSelected(new Set())} />
        </>
    );
}

export default function IssuesPage(props: IssuesPageProps) {
    const metadata: IssueMetadata = { labels: props.labels, projects: props.projects, cycles: props.cycles };

    return (
        <LinearShell issues={props.issues} metadata={metadata}>
            <IssuesContent {...props} />
        </LinearShell>
    );
}
