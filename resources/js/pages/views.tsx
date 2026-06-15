import { LinearShell } from '@/components/linear/linear-shell';
import { PageHeader, TeamBadge } from '@/components/linear/page-header';
import { Button } from '@/components/ui/button';
import { Cycle, Issue, IssueMetadata, Label, Project } from '@/lib/issues';
import { CreateItemDialog, useLocalItems } from '@/pages/projects';
import { Head } from '@inertiajs/react';
import { ChevronRight, Layers2, Plus } from 'lucide-react';
import { useState } from 'react';

function ViewsContent({ scope }: { scope: 'workspace' | 'team' }) {
    const { items, add, remove } = useLocalItems('linear-views');
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <Head title="Views" />
            <PageHeader
                left={
                    scope === 'team' ? (
                        <>
                            <TeamBadge />
                            <span className="text-foreground font-medium">Devaubree</span>
                            <ChevronRight className="text-muted-foreground/60 size-3.5" />
                            <span className="text-foreground">Views</span>
                        </>
                    ) : (
                        <span className="text-foreground font-medium">Views</span>
                    )
                }
            />
            {items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-16">
                    <span className="bg-secondary flex size-12 items-center justify-center rounded-full">
                        <Layers2 className="text-muted-foreground size-5" />
                    </span>
                    <p className="text-foreground text-sm font-medium">No views yet</p>
                    <p className="text-muted-foreground max-w-64 text-center text-[13px]">
                        Views are saved filters you can share with your team and pin to the sidebar.
                    </p>
                    <Button size="sm" onClick={() => setDialogOpen(true)} className="mt-1 h-7 gap-1.5 px-3 text-xs">
                        <Plus className="size-3.5" />
                        New view
                    </Button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-muted-foreground text-[13px]">{items.length} views</p>
                        <Button size="sm" onClick={() => setDialogOpen(true)} className="h-7 gap-1.5 px-3 text-xs">
                            <Plus className="size-3.5" />
                            New view
                        </Button>
                    </div>
                    <div className="flex flex-col gap-1">
                        {items.map((item, index) => (
                            <div
                                key={`${item.name}-${index}`}
                                className="group border-border hover:bg-muted flex h-10 items-center gap-3 rounded-md border px-3 transition-colors duration-100"
                            >
                                <Layers2 className="text-muted-foreground size-4" />
                                <span className="text-foreground text-[13px] font-medium">{item.name}</span>
                                <span className="flex-1" />
                                <span className="text-muted-foreground text-xs">{item.createdAt}</span>
                                <button
                                    onClick={() => remove(index)}
                                    className="text-muted-foreground hover:text-destructive text-xs opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <CreateItemDialog open={dialogOpen} onOpenChange={setDialogOpen} title="New view" placeholder="View name" onCreate={add} />
        </>
    );
}

export default function ViewsPage({
    issues,
    scope,
    labels,
    projects,
    cycles,
}: {
    issues: Issue[];
    scope: 'workspace' | 'team';
    labels: Label[];
    projects: Project[];
    cycles: Cycle[];
}) {
    const metadata: IssueMetadata = { labels, projects, cycles };

    return (
        <LinearShell issues={issues} metadata={metadata}>
            <ViewsContent scope={scope} />
        </LinearShell>
    );
}
