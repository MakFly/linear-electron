import { AssigneeAvatar } from '@/components/linear/assignee-avatar';
import { deleteIssue, patchIssue } from '@/components/linear/issue-row';
import { LinearShell } from '@/components/linear/linear-shell';
import { PageHeader, TeamBadge } from '@/components/linear/page-header';
import { PriorityIcon } from '@/components/linear/priority-icon';
import { StatusIcon } from '@/components/linear/status-icon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Cycle, Issue, IssueMetadata, Label, PRIORITY_META, Project, STATUS_META, STATUS_ORDER, useMembers } from '@/lib/issues';
import { Head, Link, router } from '@inertiajs/react';
import { Check, ChevronDown, ChevronRight, ChevronUp, Trash2, User } from 'lucide-react';
import { ComponentPropsWithoutRef, forwardRef, useEffect, useState } from 'react';

interface IssueDetailProps {
    issue: Issue;
    issues: Issue[];
    labels: Label[];
    projects: Project[];
    cycles: Cycle[];
}

const PropertyButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'> & { label: string }>(({ children, label, ...props }, ref) => (
    <button
        ref={ref}
        aria-label={label}
        {...props}
        className="text-foreground hover:bg-accent flex h-7 w-full items-center gap-2 rounded-md px-2 text-[13px] font-medium transition-colors duration-100"
    >
        {children}
    </button>
));
PropertyButton.displayName = 'PropertyButton';

function IssueDetailContent({ issue, issues }: { issue: Issue; issues: Issue[] }) {
    const members = useMembers();
    const [title, setTitle] = useState(issue.title);
    const [description, setDescription] = useState(issue.description ?? '');

    useEffect(() => {
        setTitle(issue.title);
        setDescription(issue.description ?? '');
    }, [issue.id, issue.title, issue.description]);

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
        <>
            <Head title={`${issue.identifier} ${issue.title}`} />
            <PageHeader
                left={
                    <>
                        <TeamBadge />
                        <Link href="/team/DEV/active" className="text-foreground hover:text-muted-foreground font-medium">
                            Devaubree
                        </Link>
                        <ChevronRight className="text-muted-foreground/60 size-3.5" />
                        <span className="text-foreground">{issue.identifier}</span>
                    </>
                }
                right={
                    <div className="flex items-center gap-0.5 pr-1">
                        <button
                            aria-label="Previous issue"
                            disabled={!prev}
                            onClick={() => prev && router.visit(`/issue/${prev.identifier}`)}
                            className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors duration-100 disabled:pointer-events-none disabled:opacity-40"
                        >
                            <ChevronUp className="size-4" />
                        </button>
                        <button
                            aria-label="Next issue"
                            disabled={!next}
                            onClick={() => next && router.visit(`/issue/${next.identifier}`)}
                            className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors duration-100 disabled:pointer-events-none disabled:opacity-40"
                        >
                            <ChevronDown className="size-4" />
                        </button>
                        <span className="text-muted-foreground px-1.5 text-xs">
                            {index + 1} / {issues.length}
                        </span>
                    </div>
                }
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Main editor */}
                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto flex max-w-3xl flex-col px-10 py-8">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={saveTitle}
                            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                            className="text-foreground placeholder:text-muted-foreground/60 bg-transparent text-[21px] font-semibold focus:outline-none"
                            placeholder="Issue title"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={saveDescription}
                            placeholder="Add description…"
                            rows={8}
                            className="text-foreground placeholder:text-muted-foreground/60 mt-3 resize-none bg-transparent text-sm leading-relaxed focus:outline-none"
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
                </div>

                {/* Properties panel */}
                <aside className="border-border w-60 shrink-0 overflow-y-auto border-l px-3 py-4">
                    <p className="text-muted-foreground mb-2 px-2 text-xs font-medium">Properties</p>
                    <div className="flex flex-col gap-0.5">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <PropertyButton label="Status">
                                    <StatusIcon status={issue.status} />
                                    {STATUS_META[issue.status].label}
                                </PropertyButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-44">
                                {STATUS_ORDER.map((status) => (
                                    <DropdownMenuItem key={status} className="gap-2 text-[13px]" onSelect={() => patchIssue(issue.id, { status })}>
                                        <StatusIcon status={status} />
                                        {STATUS_META[status].label}
                                        {issue.status === status && <Check className="ml-auto size-3.5" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <PropertyButton label="Priority">
                                    <PriorityIcon priority={issue.priority} className="size-4" />
                                    {PRIORITY_META.find((p) => p.value === issue.priority)?.label}
                                </PropertyButton>
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
                                <PropertyButton label="Assignee">
                                    <AssigneeAvatar name={issue.assignee} className="size-4 text-[8px]" />
                                    {issue.assignee ?? 'Unassigned'}
                                </PropertyButton>
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
                    </div>

                    <div className="border-border mt-6 border-t pt-4">
                        <button
                            onClick={() => deleteIssue(issue.id, { redirect: true, preserveScroll: false })}
                            className="text-destructive hover:bg-destructive/10 flex h-7 w-full items-center gap-2 rounded-md px-2 text-[13px] font-medium transition-colors duration-100"
                        >
                            <Trash2 className="size-3.5" />
                            Delete issue
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
}

export default function IssueDetailPage(props: IssueDetailProps) {
    const { issue, issues } = props;
    const metadata: IssueMetadata = { labels: props.labels, projects: props.projects, cycles: props.cycles };

    return (
        <LinearShell issues={issues} metadata={metadata}>
            <IssueDetailContent issue={issue} issues={issues} />
        </LinearShell>
    );
}
