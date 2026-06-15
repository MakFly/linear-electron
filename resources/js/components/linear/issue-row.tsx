import { AssigneeAvatar } from '@/components/linear/assignee-avatar';
import { PriorityIcon } from '@/components/linear/priority-icon';
import { useShell } from '@/components/linear/shell-context';
import { StatusIcon } from '@/components/linear/status-icon';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { clearQueuedToast, queueToast, toast } from '@/components/ui/toast';
import { Issue, IssueStatus, PRIORITY_META, STATUS_META, STATUS_ORDER, useMembers } from '@/lib/issues';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Box, CalendarDays, Check, CircleDot, Flag, Link2, Repeat2, Trash2, User, UserCircle2 } from 'lucide-react';
import { DragEvent, MouseEvent, PointerEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type IssueDisplayProperty =
    | 'id'
    | 'status'
    | 'assignee'
    | 'priority'
    | 'project'
    | 'due_date'
    | 'milestone'
    | 'labels'
    | 'links'
    | 'time'
    | 'created'
    | 'updated';

export function patchIssue(
    id: number,
    data: {
        title?: string;
        description?: string | null;
        status?: IssueStatus;
        priority?: number;
        assignee?: string | null;
        project_id?: number | null;
        cycle_id?: number | null;
        parent_id?: number | null;
        due_date?: string | null;
        estimate?: number | null;
        labels?: number[];
    },
    options: { success?: string | false; error?: string | false; onSuccess?: () => void; onError?: () => void } = {},
) {
    const successTitle = options.success === false ? null : (options.success ?? issueUpdateToast(data));
    let failed = false;
    let removeFinishListener: (() => void) | undefined;
    let successTimer: number | undefined;

    if (successTitle) {
        queueToast('success', { title: successTitle });
        successTimer = window.setTimeout(() => {
            if (failed) return;

            clearQueuedToast();
            toast.success({ title: successTitle });
        }, 1000);

        removeFinishListener = router.on('finish', () => {
            removeFinishListener?.();

            if (!failed) {
                if (successTimer) window.clearTimeout(successTimer);
                clearQueuedToast();
                window.setTimeout(() => toast.success({ title: successTitle }), 0);
            }
        });
    }

    router.patch(`/issues/${id}`, data, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
            options.onSuccess?.();
        },
        onError: () => {
            failed = true;
            if (successTimer) window.clearTimeout(successTimer);
            removeFinishListener?.();
            clearQueuedToast();

            const title = options.error === false ? null : (options.error ?? 'Issue update failed');

            if (title) toast.error({ title });
            options.onError?.();
        },
    });
}

export function deleteIssue(
    id: number,
    options: { redirect?: boolean; preserveScroll?: boolean; onSuccess?: () => void; onError?: () => void } = {},
) {
    let failed = false;
    queueToast('success', { title: 'Issue deleted' });

    const removeFinishListener = router.on('finish', () => {
        removeFinishListener();

        if (!failed) {
            clearQueuedToast();
            window.setTimeout(() => toast.success({ title: 'Issue deleted' }), 0);
            options.onSuccess?.();
        }
    });

    router.delete(`/issues/${id}`, {
        data: options.redirect ? { redirect: true } : undefined,
        preserveScroll: options.preserveScroll ?? true,
        onError: () => {
            failed = true;
            removeFinishListener();
            clearQueuedToast();
            toast.error({ title: 'Issue deletion failed' });
            options.onError?.();
        },
    });
}

function issueUpdateToast(data: Parameters<typeof patchIssue>[1]) {
    if ('status' in data) return 'Status updated';
    if ('priority' in data) return 'Priority updated';
    if ('assignee' in data) return 'Assignee updated';
    if ('project_id' in data) return 'Project updated';
    if ('cycle_id' in data) return 'Cycle updated';
    if ('estimate' in data) return 'Estimate updated';
    if ('due_date' in data) return 'Due date updated';
    if ('parent_id' in data) return 'Parent issue updated';
    if ('labels' in data) return 'Labels updated';
    if ('title' in data) return 'Title updated';
    if ('description' in data) return 'Description updated';

    return 'Issue updated';
}

function stop(e: MouseEvent) {
    e.stopPropagation();
}

interface IssueRowProps {
    issue: Issue;
    selected: boolean;
    onSelect: (id: number, checked: boolean) => void;
    dragging?: boolean;
    draggable?: boolean;
    dropPosition?: 'before' | 'after' | null;
    onDragStart?: (event: DragEvent<HTMLDivElement>, issue: Issue) => void;
    onDragOver?: (event: DragEvent<HTMLDivElement>, issue: Issue) => void;
    onDrop?: (event: DragEvent<HTMLDivElement>, issue: Issue) => void;
    onDragEnd?: () => void;
    onPointerDown?: (event: PointerEvent<HTMLDivElement>, issue: Issue) => void;
    onPointerUp?: (event: PointerEvent<HTMLDivElement>, issue: Issue) => void;
    onMouseDown?: (event: MouseEvent<HTMLDivElement>, issue: Issue) => void;
    onMouseUp?: (event: MouseEvent<HTMLDivElement>, issue: Issue) => void;
    onIssueClick?: (event: MouseEvent<HTMLDivElement>, issue: Issue) => boolean | void;
    visibleProperties?: ReadonlySet<IssueDisplayProperty>;
}

function MenuRows({ issue, members }: { issue: Issue; members: string[] }): { statuses: ReactNode; priorities: ReactNode; assignees: ReactNode } {
    return {
        statuses: STATUS_ORDER.map((status) => (
            <ContextMenuItem key={status} className="gap-2 text-[13px]" onSelect={() => patchIssue(issue.id, { status })}>
                <StatusIcon status={status} />
                {STATUS_META[status].label}
                {issue.status === status && <Check className="ml-auto size-3.5" />}
            </ContextMenuItem>
        )),
        priorities: PRIORITY_META.map((p) => (
            <ContextMenuItem key={p.value} className="gap-2 text-[13px]" onSelect={() => patchIssue(issue.id, { priority: p.value })}>
                <PriorityIcon priority={p.value} className="size-4" />
                {p.label}
                {issue.priority === p.value && <Check className="ml-auto size-3.5" />}
            </ContextMenuItem>
        )),
        assignees: (
            <>
                <ContextMenuItem className="gap-2 text-[13px]" onSelect={() => patchIssue(issue.id, { assignee: null })}>
                    <User className="text-muted-foreground size-4" />
                    No assignee
                    {!issue.assignee && <Check className="ml-auto size-3.5" />}
                </ContextMenuItem>
                {members.map((member) => (
                    <ContextMenuItem key={member} className="gap-2 text-[13px]" onSelect={() => patchIssue(issue.id, { assignee: member })}>
                        <AssigneeAvatar name={member} className="size-4 text-[8px]" />
                        {member}
                        {issue.assignee === member && <Check className="ml-auto size-3.5" />}
                    </ContextMenuItem>
                ))}
            </>
        ),
    };
}

export function IssueRow({
    issue,
    selected,
    onSelect,
    dragging,
    draggable,
    dropPosition,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onPointerDown,
    onPointerUp,
    onMouseDown,
    onMouseUp,
    onIssueClick,
    visibleProperties,
}: IssueRowProps) {
    const { t } = useTranslation();
    const members = useMembers();
    const { openIssue } = useShell();
    const menus = MenuRows({ issue, members });
    const showProperty = (property: IssueDisplayProperty) => visibleProperties?.has(property) ?? true;

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <div
                    draggable={false}
                    data-issue-row-id={issue.id}
                    data-draggable-row={draggable || undefined}
                    data-selected={selected || undefined}
                    data-dragging={dragging || undefined}
                    onClick={(event) => {
                        if (onIssueClick?.(event, issue) === false) return;
                        openIssue(issue);
                    }}
                    onDragStart={(event) => onDragStart?.(event, issue)}
                    onDragOver={(event) => onDragOver?.(event, issue)}
                    onDrop={(event) => onDrop?.(event, issue)}
                    onDragEnd={onDragEnd}
                    onPointerDownCapture={(event) => onPointerDown?.(event, issue)}
                    onPointerUpCapture={(event) => onPointerUp?.(event, issue)}
                    onMouseDownCapture={(event) => onMouseDown?.(event, issue)}
                    onMouseUpCapture={(event) => onMouseUp?.(event, issue)}
                    onSelect={(event) => {
                        if (draggable) event.preventDefault();
                    }}
                    className={cn(
                        'group relative flex h-9 shrink-0 cursor-default items-center gap-2 pr-6 pl-2 select-none',
                        'hover:bg-muted data-[selected]:bg-primary/10 transition-colors duration-100 data-[dragging]:opacity-45',
                        'animate-in fade-in duration-150',
                        draggable && 'cursor-grab active:cursor-grabbing',
                    )}
                >
                    {dropPosition === 'before' && <span className="bg-primary pointer-events-none absolute top-0 right-2 left-2 h-px" />}
                    {dropPosition === 'after' && <span className="bg-primary pointer-events-none absolute right-2 bottom-0 left-2 h-px" />}
                    <span className="flex w-5 shrink-0 items-center justify-center" onClick={stop}>
                        <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) => onSelect(issue.id, checked === true)}
                            className={cn(
                                'border-muted-foreground/50 size-3.5 rounded-[4px] opacity-0 transition-opacity duration-100',
                                'group-hover:opacity-100 data-[state=checked]:opacity-100',
                            )}
                        />
                    </span>

                    {showProperty('priority') && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    aria-label={t('issueRow.setPriority')}
                                    onClick={stop}
                                    className="hover:bg-accent flex size-6 shrink-0 items-center justify-center rounded transition-colors duration-100"
                                >
                                    <PriorityIcon priority={issue.priority} className="size-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-44" onClick={stop}>
                                {PRIORITY_META.map((p) => (
                                    <DropdownMenuItem
                                        key={p.value}
                                        className="gap-2 text-[13px]"
                                        onSelect={() => patchIssue(issue.id, { priority: p.value })}
                                    >
                                        <PriorityIcon priority={p.value} className="size-4" />
                                        {p.label}
                                        {issue.priority === p.value && <Check className="ml-auto size-3.5" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {showProperty('id') && (
                        <span className="text-muted-foreground hidden h-6 w-[46px] shrink-0 items-center justify-start overflow-hidden font-mono text-[12px] leading-none font-medium tracking-normal whitespace-nowrap tabular-nums min-[420px]:inline-flex">
                            {issue.identifier}
                        </span>
                    )}

                    {showProperty('status') && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    aria-label={t('issueRow.changeStatus')}
                                    onClick={stop}
                                    className="hover:bg-accent flex size-6 shrink-0 items-center justify-center rounded transition-colors duration-100"
                                >
                                    <StatusIcon status={issue.status} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-44" onClick={stop}>
                                {STATUS_ORDER.map((status) => (
                                    <DropdownMenuItem key={status} className="gap-2 text-[13px]" onSelect={() => patchIssue(issue.id, { status })}>
                                        <StatusIcon status={status} />
                                        {STATUS_META[status].label}
                                        {issue.status === status && <Check className="ml-auto size-3.5" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <span className="text-foreground min-w-0 truncate text-[13px] font-medium">{issue.title}</span>

                    {showProperty('labels') &&
                        issue.labels.slice(0, 2).map((label) => (
                            <span
                                key={label.id}
                                className="border-border/80 bg-muted/40 text-muted-foreground hidden h-5 shrink-0 items-center gap-1 rounded-md border px-1.5 text-[11px] lg:flex"
                            >
                                <span className="size-2 rounded-full" style={{ backgroundColor: label.color }} />
                                {label.name}
                            </span>
                        ))}

                    <span className="flex-1" />

                    {showProperty('project') && issue.project && (
                        <span className="text-muted-foreground hidden h-6 shrink-0 items-center gap-1.5 rounded-md px-1.5 text-xs xl:flex">
                            <Box className="size-3.5" />
                            {issue.project.name}
                        </span>
                    )}

                    {showProperty('milestone') && issue.cycle && (
                        <span className="text-muted-foreground hidden h-6 shrink-0 items-center gap-1.5 rounded-md px-1.5 text-xs xl:flex">
                            <Repeat2 className="size-3.5" />C{issue.cycle.number}
                        </span>
                    )}

                    {showProperty('links') && issue.relations.length > 0 && (
                        <span className="text-muted-foreground hidden h-6 shrink-0 items-center gap-1.5 rounded-md px-1.5 text-xs xl:flex">
                            <Link2 className="size-3.5" />
                            {issue.relations.length}
                        </span>
                    )}

                    {showProperty('due_date') && issue.due_date && (
                        <span className="text-muted-foreground hidden h-6 shrink-0 items-center gap-1.5 rounded-md px-1.5 text-xs xl:flex">
                            <CalendarDays className="size-3.5" />
                            {issue.due_date}
                        </span>
                    )}

                    {showProperty('assignee') && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    aria-label={t('issueRow.assign')}
                                    onClick={stop}
                                    className="hover:bg-accent flex size-6 shrink-0 items-center justify-center rounded transition-colors duration-100"
                                >
                                    <AssigneeAvatar name={issue.assignee} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44" onClick={stop}>
                                <DropdownMenuItem className="gap-2 text-[13px]" onSelect={() => patchIssue(issue.id, { assignee: null })}>
                                    <User className="text-muted-foreground size-4" />
                                    No assignee
                                    {!issue.assignee && <Check className="ml-auto size-3.5" />}
                                </DropdownMenuItem>
                                {members.map((member) => (
                                    <DropdownMenuItem
                                        key={member}
                                        className="gap-2 text-[13px]"
                                        onSelect={() => patchIssue(issue.id, { assignee: member })}
                                    >
                                        <AssigneeAvatar name={member} className="size-4 text-[8px]" />
                                        {member}
                                        {issue.assignee === member && <Check className="ml-auto size-3.5" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {showProperty('created') && <span className="text-muted-foreground shrink-0 text-xs">{issue.created_label}</span>}
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-52">
                <ContextMenuSub>
                    <ContextMenuSubTrigger className="gap-2 text-[13px]">
                        <CircleDot className="text-muted-foreground size-4" />
                        Status
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-44">{menus.statuses}</ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSub>
                    <ContextMenuSubTrigger className="gap-2 text-[13px]">
                        <Flag className="text-muted-foreground size-4" />
                        Priority
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-44">{menus.priorities}</ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSub>
                    <ContextMenuSubTrigger className="gap-2 text-[13px]">
                        <UserCircle2 className="text-muted-foreground size-4" />
                        Assignee
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-44">{menus.assignees}</ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-destructive focus:text-destructive gap-2 text-[13px]" onSelect={() => deleteIssue(issue.id)}>
                    <Trash2 className="size-4" />
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
