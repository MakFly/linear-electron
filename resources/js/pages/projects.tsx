import { LinearShell } from '@/components/linear/linear-shell';
import { PageHeader, TeamBadge } from '@/components/linear/page-header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { Cycle, Issue, IssueMetadata, Label, Project } from '@/lib/issues';
import { Head, Link, router } from '@inertiajs/react';
import { Box, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LocalItem {
    name: string;
    createdAt: string;
}

export function useLocalItems(storageKey: string) {
    const [items, setItems] = useState<LocalItem[]>([]);

    useEffect(() => {
        try {
            setItems(JSON.parse(localStorage.getItem(storageKey) ?? '[]'));
        } catch {
            setItems([]);
        }
    }, [storageKey]);

    const add = (name: string) => {
        const next = [...items, { name, createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }];
        setItems(next);
        localStorage.setItem(storageKey, JSON.stringify(next));
    };

    const remove = (index: number) => {
        const next = items.filter((_, i) => i !== index);
        setItems(next);
        localStorage.setItem(storageKey, JSON.stringify(next));
    };

    return { items, add, remove };
}

export function CreateItemDialog({
    open,
    onOpenChange,
    title,
    placeholder,
    onCreate,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    placeholder: string;
    onCreate: (name: string) => void;
}) {
    const [name, setName] = useState('');

    useEffect(() => {
        if (open) setName('');
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border bg-popover max-w-md">
                <DialogTitle className="text-foreground text-sm font-medium">{title}</DialogTitle>
                <form
                    className="flex flex-col gap-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!name.trim()) return;
                        onCreate(name.trim());
                        onOpenChange(false);
                    }}
                >
                    <input
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={placeholder}
                        className="border-input text-foreground placeholder:text-muted-foreground/60 focus:ring-ring h-9 rounded-md border bg-transparent px-3 text-[13px] focus:ring-1 focus:outline-none"
                    />
                    <div className="flex justify-end">
                        <Button type="submit" size="sm" disabled={!name.trim()} className="h-7 px-3 text-xs">
                            Create
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ProjectsContent({
    scope,
    projects,
    selectedProject,
}: {
    scope: 'workspace' | 'team';
    projects: Project[];
    selectedProject?: Project | null;
}) {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <Head title="Projects" />
            <PageHeader
                left={
                    scope === 'team' ? (
                        <>
                            <TeamBadge />
                            <span className="text-foreground font-medium">Devaubree</span>
                            <ChevronRight className="text-muted-foreground/60 size-3.5" />
                            <span className="text-foreground">Projects</span>
                        </>
                    ) : (
                        <span className="text-foreground font-medium">Projects</span>
                    )
                }
            />
            {selectedProject ? (
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    <div className="border-border bg-card/40 rounded-lg border p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <span className="size-3 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                            <h1 className="text-foreground text-lg font-medium">{selectedProject.name}</h1>
                        </div>
                        <p className="text-muted-foreground max-w-xl text-[13px]">{selectedProject.description}</p>
                        <div className="text-muted-foreground mt-4 flex gap-4 text-xs">
                            <span>Status: {selectedProject.status}</span>
                            <span>{selectedProject.issues_count ?? 0} issues</span>
                            {selectedProject.target_date && <span>Target: {selectedProject.target_date}</span>}
                        </div>
                    </div>
                </div>
            ) : projects.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-16">
                    <span className="bg-secondary flex size-12 items-center justify-center rounded-full">
                        <Box className="text-muted-foreground size-5" />
                    </span>
                    <p className="text-foreground text-sm font-medium">No projects yet</p>
                    <p className="text-muted-foreground max-w-64 text-center text-[13px]">
                        A project is a larger unit of work with a clear outcome, like a launch or a milestone.
                    </p>
                    <Button size="sm" onClick={() => setDialogOpen(true)} className="mt-1 h-7 gap-1.5 px-3 text-xs">
                        <Plus className="size-3.5" />
                        New project
                    </Button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-muted-foreground text-[13px]">{projects.length} projects</p>
                        <Button size="sm" onClick={() => setDialogOpen(true)} className="h-7 gap-1.5 px-3 text-xs">
                            <Plus className="size-3.5" />
                            New project
                        </Button>
                    </div>
                    <div className="flex flex-col gap-1">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/team/DEV/projects/${project.id}`}
                                className="group border-border hover:bg-muted flex h-10 items-center gap-3 rounded-md border px-3 transition-colors duration-100"
                            >
                                <span className="size-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                                <span className="text-foreground text-[13px] font-medium">{project.name}</span>
                                <span className="flex-1" />
                                <span className="text-muted-foreground text-xs">{project.issues_count ?? 0} issues</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            <CreateItemDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title="New project"
                placeholder="Project name"
                onCreate={(name) =>
                    router.post(
                        '/projects',
                        { name },
                        {
                            preserveScroll: true,
                            preserveState: true,
                            onSuccess: () => toast.success({ title: 'Project created' }),
                            onError: () => toast.error({ title: 'Project creation failed' }),
                        },
                    )
                }
            />
        </>
    );
}

export default function ProjectsPage({
    issues,
    scope,
    labels,
    projects,
    cycles,
    selectedProject,
}: {
    issues: Issue[];
    scope: 'workspace' | 'team';
    labels: Label[];
    projects: Project[];
    cycles: Cycle[];
    selectedProject?: Project | null;
}) {
    const metadata: IssueMetadata = { labels, projects, cycles };

    return (
        <LinearShell issues={issues} metadata={metadata}>
            <ProjectsContent scope={scope} projects={projects} selectedProject={selectedProject} />
        </LinearShell>
    );
}
