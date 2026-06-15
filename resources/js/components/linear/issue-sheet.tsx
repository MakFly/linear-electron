import { AssigneeAvatar } from '@/components/linear/assignee-avatar';
import { deleteIssue, patchIssue } from '@/components/linear/issue-row';
import { PriorityIcon } from '@/components/linear/priority-icon';
import { StatusIcon } from '@/components/linear/status-icon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Issue, IssueMetadata, PRIORITY_META, STATUS_META, STATUS_ORDER, useMembers } from '@/lib/issues';
import { router } from '@inertiajs/react';
import {
    Box,
    Calendar,
    Check,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    GitBranch,
    Link2,
    MoreHorizontal,
    Repeat2,
    Tag,
    Trash2,
    User,
} from 'lucide-react';
import { ComponentPropsWithoutRef, forwardRef, useEffect, useState } from 'react';

const PropRow = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'> & { label: string }>(({ children, label, ...props }, ref) => (
    <button
        ref={ref}
        aria-label={label}
        {...props}
        className="text-foreground hover:bg-accent flex h-7 w-full items-center gap-2 rounded-md px-2 text-[13px] font-medium transition-colors duration-100"
    >
        {children}
    </button>
));
PropRow.displayName = 'PropRow';

interface IssueSheetProps {
    issue: Issue | null;
    issues: Issue[];
    metadata: IssueMetadata;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onNavigate: (issue: Issue) => void;
}

const estimates = [1, 2, 3, 5, 8];

const relationLabels: Record<string, string> = {
    blocks: 'Blocks',
    blocked_by: 'Blocked by',
    duplicate: 'Duplicate of',
    relates: 'Related to',
};

export function IssueSheet({ issue, issues, metadata, open, onOpenChange, onNavigate }: IssueSheetProps) {
    const members = useMembers();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (issue) {
            setTitle(issue.title);
            setDescription(issue.description ?? '');
        }
    }, [issue]);

    if (!issue) return null;

    const saveTitle = () => {
        const trimmed = title.trim();
        if (trimmed && trimmed !== issue.title) patchIssue(issue.id, { title: trimmed });
        else setTitle(issue.title);
    };

    const saveDescription = () => {
        const value = description.trim() || null;
        if (value !== issue.description) patchIssue(issue.id, { description: value });
    };

    const index = issues.findIndex((i) => i.id === issue.id);
    const prev = issues[index - 1];
    const next = issues[index + 1];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="border-border bg-card !inset-y-2.5 !right-2.5 !h-auto max-h-[calc(100dvh-1.25rem)] w-full gap-0 overflow-hidden rounded-xl border p-0 shadow-2xl sm:max-w-3xl [&>button]:hidden"
            >
                <SheetTitle className="sr-only">
                    {issue.identifier} {issue.title}
                </SheetTitle>

                {/* Sheet header: breadcrumb + prev/next + actions */}
                <div className="flex h-full w-full flex-col">
                    <div className="border-border flex h-11 shrink-0 items-center justify-between border-b px-4">
                        <div className="text-muted-foreground flex items-center gap-2 text-[13px]">
                            <span className="text-foreground">Issues</span>
                            <ChevronRight className="text-muted-foreground/60 size-3.5" />
                            <span className="text-foreground">{issue.identifier}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <button
                                aria-label="Previous issue"
                                disabled={!prev}
                                onClick={() => prev && onNavigate(prev)}
                                className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors duration-100 disabled:pointer-events-none disabled:opacity-40"
                            >
                                <ChevronUp className="size-4" />
                            </button>
                            <button
                                aria-label="Next issue"
                                disabled={!next}
                                onClick={() => next && onNavigate(next)}
                                className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors duration-100 disabled:pointer-events-none disabled:opacity-40"
                            >
                                <ChevronDown className="size-4" />
                            </button>
                            <span className="text-muted-foreground px-1.5 text-xs">
                                {index + 1} / {issues.length}
                            </span>
                            <button
                                aria-label="Open full page"
                                onClick={() => router.visit(`/issue/${issue.identifier}`)}
                                className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors duration-100"
                            >
                                <Link2 className="size-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-1">
                        {/* Editor */}
                        <div className="flex-1 overflow-y-auto px-10 py-8">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={saveTitle}
                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                className="text-foreground placeholder:text-muted-foreground/60 w-full bg-transparent text-[21px] font-semibold focus:outline-none"
                                placeholder="Issue title"
                            />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={saveDescription}
                                placeholder="Add description…"
                                rows={6}
                                className="text-foreground placeholder:text-muted-foreground/60 mt-3 w-full resize-none bg-transparent text-sm leading-relaxed focus:outline-none"
                            />

                            <div className="border-border mt-8 border-t pt-6">
                                <p className="text-foreground mb-4 text-[13px] font-medium">Activity</p>
                                <div className="text-muted-foreground flex items-center gap-2.5 text-[13px]">
                                    <AssigneeAvatar name={members[0]} className="size-4 text-[8px]" />
                                    <span>
                                        <span className="text-foreground">{members[0]}</span> created the issue
                                    </span>
                                    <span>·</span>
                                    <span>{issue.created_label}</span>
                                </div>
                            </div>
                        </div>

                        {/* Properties */}
                        <aside className="border-border w-60 shrink-0 overflow-y-auto border-l px-3 py-4">
                            <div className="mb-2 flex items-center justify-between px-2">
                                <p className="text-muted-foreground text-xs font-medium">Properties</p>
                                <MoreHorizontal className="text-muted-foreground size-3.5" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <PropRow label="Status">
                                            <StatusIcon status={issue.status} />
                                            {STATUS_META[issue.status].label}
                                        </PropRow>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-44">
                                        {STATUS_ORDER.map((status) => (
                                            <DropdownMenuItem
                                                key={status}
                                                className="gap-2 text-[13px]"
                                                onSelect={() => patchIssue(issue.id, { status })}
                                            >
                                                <StatusIcon status={status} />
                                                {STATUS_META[status].label}
                                                {issue.status === status && <Check className="ml-auto size-3.5" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <PropRow label="Priority">
                                            <PriorityIcon priority={issue.priority} className="size-4" />
                                            {PRIORITY_META.find((p) => p.value === issue.priority)?.label}
                                        </PropRow>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-44">
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

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <PropRow label="Assignee">
                                            <AssigneeAvatar name={issue.assignee} className="size-4 text-[8px]" />
                                            {issue.assignee ?? 'Assign'}
                                        </PropRow>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-44">
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

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <PropRow label="Project">
                                            <Box className="text-muted-foreground size-4" />
                                            {issue.project?.name ?? 'No project'}
                                        </PropRow>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-56">
                                        <DropdownMenuItem className="gap-2 text-[13px]" onSelect={() => patchIssue(issue.id, { project_id: null })}>
                                            <Box className="text-muted-foreground size-4" />
                                            No project
                                            {!issue.project_id && <Check className="ml-auto size-3.5" />}
                                        </DropdownMenuItem>
                                        {metadata.projects.map((project) => (
                                            <DropdownMenuItem
                                                key={project.id}
                                                className="gap-2 text-[13px]"
                                                onSelect={() => patchIssue(issue.id, { project_id: project.id })}
                                            >
                                                <span className="size-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                                                {project.name}
                                                {issue.project_id === project.id && <Check className="ml-auto size-3.5" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <PropRow label="Cycle">
                                            <Repeat2 className="text-muted-foreground size-4" />
                                            {issue.cycle ? `Cycle ${issue.cycle.number}` : 'No cycle'}
                                        </PropRow>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-44">
                                        <DropdownMenuItem className="gap-2 text-[13px]" onSelect={() => patchIssue(issue.id, { cycle_id: null })}>
                                            <Repeat2 className="text-muted-foreground size-4" />
                                            No cycle
                                            {!issue.cycle_id && <Check className="ml-auto size-3.5" />}
                                        </DropdownMenuItem>
                                        {metadata.cycles.map((cycle) => (
                                            <DropdownMenuItem
                                                key={cycle.id}
                                                className="gap-2 text-[13px]"
                                                onSelect={() => patchIssue(issue.id, { cycle_id: cycle.id })}
                                            >
                                                <Repeat2 className="text-muted-foreground size-4" />
                                                Cycle {cycle.number}
                                                {issue.cycle_id === cycle.id && <Check className="ml-auto size-3.5" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <PropRow label="Estimate">
                                            <span className="text-muted-foreground flex size-4 items-center justify-center text-[11px]">ƒ</span>
                                            {issue.estimate ? `${issue.estimate} points` : 'No estimate'}
                                        </PropRow>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-44">
                                        <DropdownMenuItem className="text-[13px]" onSelect={() => patchIssue(issue.id, { estimate: null })}>
                                            No estimate
                                            {!issue.estimate && <Check className="ml-auto size-3.5" />}
                                        </DropdownMenuItem>
                                        {estimates.map((estimate) => (
                                            <DropdownMenuItem
                                                key={estimate}
                                                className="text-[13px]"
                                                onSelect={() => patchIssue(issue.id, { estimate })}
                                            >
                                                {estimate} points
                                                {issue.estimate === estimate && <Check className="ml-auto size-3.5" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <label className="text-foreground hover:bg-accent flex h-7 w-full items-center gap-2 rounded-md px-2 text-[13px] font-medium transition-colors duration-100">
                                    <Calendar className="text-muted-foreground size-4" />
                                    <input
                                        aria-label="Due date"
                                        type="date"
                                        value={issue.due_date ?? ''}
                                        onChange={(event) => patchIssue(issue.id, { due_date: event.target.value || null })}
                                        className="w-full bg-transparent text-[13px] focus:outline-none"
                                    />
                                </label>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <PropRow label="Parent issue">
                                            <GitBranch className="text-muted-foreground size-4" />
                                            {issue.parent?.identifier ?? 'No parent'}
                                        </PropRow>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-64">
                                        <DropdownMenuItem className="gap-2 text-[13px]" onSelect={() => patchIssue(issue.id, { parent_id: null })}>
                                            <GitBranch className="text-muted-foreground size-4" />
                                            No parent
                                            {!issue.parent_id && <Check className="ml-auto size-3.5" />}
                                        </DropdownMenuItem>
                                        {issues
                                            .filter((candidate) => candidate.id !== issue.id)
                                            .map((candidate) => (
                                                <DropdownMenuItem
                                                    key={candidate.id}
                                                    className="gap-2 text-[13px]"
                                                    onSelect={() => patchIssue(issue.id, { parent_id: candidate.id })}
                                                >
                                                    <span className="text-muted-foreground w-12">{candidate.identifier}</span>
                                                    <span className="truncate">{candidate.title}</span>
                                                    {issue.parent_id === candidate.id && <Check className="ml-auto size-3.5" />}
                                                </DropdownMenuItem>
                                            ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <p className="text-muted-foreground mt-5 mb-2 px-2 text-xs font-medium">Labels</p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <PropRow label="Add label">
                                        <Tag className="text-muted-foreground size-4" />
                                        <span className={issue.labels.length === 0 ? 'text-muted-foreground' : undefined}>
                                            {issue.labels.length === 0 ? 'Add label' : `${issue.labels.length} labels`}
                                        </span>
                                    </PropRow>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-52">
                                    {metadata.labels.map((label) => {
                                        const selected = issue.labels.some((current) => current.id === label.id);
                                        const nextLabels = selected
                                            ? issue.labels.filter((current) => current.id !== label.id).map((current) => current.id)
                                            : [...issue.labels.map((current) => current.id), label.id];

                                        return (
                                            <DropdownMenuItem
                                                key={label.id}
                                                className="gap-2 text-[13px]"
                                                onSelect={() => {
                                                    patchIssue(issue.id, { labels: nextLabels });
                                                }}
                                            >
                                                <span className="size-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                                                {label.name}
                                                {selected && <Check className="ml-auto size-3.5" />}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <div className="mt-1 flex flex-wrap gap-1 px-2">
                                {issue.labels.map((label) => (
                                    <span
                                        key={label.id}
                                        className="bg-muted text-muted-foreground flex h-5 items-center gap-1 rounded-md px-1.5 text-[11px]"
                                    >
                                        <span className="size-2 rounded-full" style={{ backgroundColor: label.color }} />
                                        {label.name}
                                    </span>
                                ))}
                            </div>

                            {(issue.children.length > 0 || issue.relations.length > 0) && (
                                <div className="border-border mt-5 border-t pt-4">
                                    {issue.children.length > 0 && (
                                        <>
                                            <p className="text-muted-foreground mb-2 px-2 text-xs font-medium">Sub-issues</p>
                                            {issue.children.map((child) => (
                                                <button
                                                    key={child.id}
                                                    onClick={() => onNavigate(issues.find((candidate) => candidate.id === child.id) ?? issue)}
                                                    className="hover:bg-accent flex h-7 w-full items-center gap-2 rounded-md px-2 text-[13px]"
                                                >
                                                    <span className="text-muted-foreground">{child.identifier}</span>
                                                    <span className="truncate">{child.title}</span>
                                                </button>
                                            ))}
                                        </>
                                    )}
                                    {issue.relations.length > 0 && (
                                        <>
                                            <p className="text-muted-foreground mt-4 mb-2 px-2 text-xs font-medium">Relations</p>
                                            {issue.relations.map((relation) => (
                                                <button
                                                    key={relation.id}
                                                    onClick={() =>
                                                        onNavigate(issues.find((candidate) => candidate.id === relation.related_issue.id) ?? issue)
                                                    }
                                                    className="hover:bg-accent flex h-7 w-full items-center gap-2 rounded-md px-2 text-[13px]"
                                                >
                                                    <span className="text-muted-foreground">{relationLabels[relation.type] ?? relation.type}</span>
                                                    <span className="truncate">{relation.related_issue.identifier}</span>
                                                </button>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="border-border mt-6 border-t pt-4">
                                <button
                                    onClick={() => {
                                        deleteIssue(issue.id);
                                        onOpenChange(false);
                                    }}
                                    className="text-destructive hover:bg-destructive/10 flex h-7 w-full items-center gap-2 rounded-md px-2 text-[13px] font-medium transition-colors duration-100"
                                >
                                    <Trash2 className="size-3.5" />
                                    Delete issue
                                </button>
                            </div>
                        </aside>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
