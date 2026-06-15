import { BulkBar } from '@/components/linear/bulk-bar';
import { IssueRow } from '@/components/linear/issue-row';
import { LinearShell } from '@/components/linear/linear-shell';
import { PageHeader } from '@/components/linear/page-header';
import { StatusIcon } from '@/components/linear/status-icon';
import { Cycle, Issue, IssueMetadata, Label, Project, STATUS_META, STATUS_ORDER, useMembers } from '@/lib/issues';
import { Head } from '@inertiajs/react';
import { ChevronDown, UserCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';

function MyIssuesContent({ issues }: { issues: Issue[] }) {
    const me = useMembers()[0];
    const [selected, setSelected] = useState<Set<number>>(new Set());

    const mine = useMemo(() => issues.filter((i) => i.assignee === me), [issues, me]);

    const groups = useMemo(
        () => STATUS_ORDER.map((status) => ({ status, items: mine.filter((i) => i.status === status) })).filter((g) => g.items.length > 0),
        [mine],
    );

    const toggleSelect = (id: number, checked: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    return (
        <>
            <Head title="My issues" />
            <PageHeader left={<span className="text-foreground font-medium">My issues</span>} />
            {groups.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-16">
                    <span className="bg-secondary flex size-12 items-center justify-center rounded-full">
                        <UserCircle2 className="text-muted-foreground size-5" />
                    </span>
                    <p className="text-foreground text-sm font-medium">No issues assigned to you</p>
                    <p className="text-muted-foreground max-w-64 text-center text-[13px]">
                        Issues assigned to {me} will show up here. Assign one from the issues list.
                    </p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pt-1 pb-10">
                    {groups.map((group) => (
                        <section key={group.status}>
                            <div className="bg-secondary mx-2 flex h-9 items-center gap-2 rounded-lg pr-2 pl-2.5">
                                <ChevronDown className="text-muted-foreground/60 size-3" />
                                <StatusIcon status={group.status} />
                                <span className="text-foreground text-[13px] font-medium">{STATUS_META[group.status].label}</span>
                                <span className="text-muted-foreground text-[13px]">{group.items.length}</span>
                            </div>
                            <div className="flex flex-col gap-2 py-1.5">
                                {group.items.map((issue) => (
                                    <IssueRow key={issue.id} issue={issue} selected={selected.has(issue.id)} onSelect={toggleSelect} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
            <BulkBar ids={[...selected]} onClear={() => setSelected(new Set())} />
        </>
    );
}

export default function MyIssuesPage({
    issues,
    labels,
    projects,
    cycles,
}: {
    issues: Issue[];
    labels: Label[];
    projects: Project[];
    cycles: Cycle[];
}) {
    const metadata: IssueMetadata = { labels, projects, cycles };

    return (
        <LinearShell issues={issues} metadata={metadata}>
            <MyIssuesContent issues={issues} />
        </LinearShell>
    );
}
