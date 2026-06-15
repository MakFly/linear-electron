import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toast';
import { IssueMetadata, IssueStatus, PRIORITY_META, STATUS_META, STATUS_ORDER } from '@/lib/issues';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Box, Maximize2, Minimize2, MoreHorizontal, Paperclip, Tag, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PriorityIcon } from './priority-icon';
import { StatusIcon } from './status-icon';

interface NewIssueDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultStatus: IssueStatus;
    metadata: IssueMetadata;
}

export function NewIssueDialog({ open, onOpenChange, defaultStatus, metadata }: NewIssueDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<IssueStatus>(defaultStatus);
    const [priority, setPriority] = useState(0);
    const [projectId, setProjectId] = useState<number | null>(null);
    const [cycleId, setCycleId] = useState<number | null>(null);
    const [createMore, setCreateMore] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setTitle('');
            setDescription('');
            setStatus(defaultStatus);
            setPriority(0);
            setProjectId(null);
            setCycleId(null);
            setCreateMore(false);
            setExpanded(false);
        }
    }, [open, defaultStatus, metadata.projects, metadata.cycles]);

    const submit = () => {
        if (!title.trim() || submitting) return;
        setSubmitting(true);
        router.post(
            '/issues',
            { title: title.trim(), description: description.trim() || null, status, priority, project_id: projectId, cycle_id: cycleId },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success({ title: 'Issue created' });
                    if (createMore) {
                        setTitle('');
                        setDescription('');
                        setStatus(defaultStatus);
                        setPriority(0);
                        setProjectId(null);
                        setCycleId(null);
                        return;
                    }
                    onOpenChange(false);
                },
                onError: () => toast.error({ title: 'Issue creation failed' }),
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'top-[22%] flex max-w-[774px] translate-y-0 flex-col gap-0 overflow-hidden rounded-[22px] border-[0.5px] p-0 text-[lch(90.895_1.375_272)] shadow-none',
                    'data-[state=open]:zoom-in-100 [&>button:last-child]:top-3.5 [&>button:last-child]:right-4 [&>button:last-child]:flex [&>button:last-child]:size-7 [&>button:last-child]:items-center [&>button:last-child]:justify-center [&>button:last-child]:rounded-full [&>button:last-child]:opacity-100 [&>button:last-child]:ring-0 [&>button:last-child]:ring-offset-0 [&>button:last-child]:hover:bg-[lch(16.091_0.943_272)] [&>button:last-child]:focus:ring-0 [&>button:last-child]:[&>svg]:size-4',
                    expanded && 'top-[16%] h-[calc(100vh-190px)] max-w-[846px]',
                )}
                style={{
                    backgroundColor: 'lch(9.92 0.75 272)',
                    borderColor: 'lch(22.88 1.83 272)',
                    borderRadius: 22,
                    boxShadow:
                        'lch(0 0 0 / 0.1) 0px 4px 40px 0px, lch(0 0 0 / 0.125) 0px 3px 20px 0px, lch(0 0 0 / 0.125) 0px 3px 12px 0px, lch(0 0 0 / 0.125) 0px 2px 8px 0px, lch(0 0 0 / 0.125) 0px 1px 1px 0px',
                }}
            >
                <DialogTitle className="sr-only">New issue</DialogTitle>
                <button
                    type="button"
                    aria-label={expanded ? 'Collapse' : 'Expand'}
                    onClick={() => setExpanded((value) => !value)}
                    className="absolute top-3.5 right-12 z-10 flex size-7 items-center justify-center rounded-full text-[lch(90.895_1.375_272)] transition-colors hover:bg-[lch(16.091_0.943_272)]"
                >
                    {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </button>
                <div className="flex items-center gap-2 px-5 pt-4">
                    <button
                        type="button"
                        aria-label="Set team"
                        className="flex h-6 items-center gap-1.5 rounded-full bg-[lch(16.091_0.943_272)] pr-2 pl-1.5 text-xs font-medium text-[lch(90.895_1.375_272)] opacity-90"
                    >
                        <span className="flex size-3.5 items-center justify-center rounded-[3px] bg-[#94C748] text-[8px] font-semibold text-[#0f120d]">
                            D
                        </span>
                        DEV
                    </button>
                    <span className="text-[13px] text-[lch(63.582_1.375_272)]">›</span>
                    <span className="text-[13px] font-[450] text-[lch(90.895_1.375_272)]">New issue</span>
                </div>
                <form
                    className="flex min-h-0 flex-1 flex-col"
                    onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                    }}
                >
                    <div className={cn('flex min-h-0 flex-col px-5 pt-5', expanded ? 'flex-1' : 'pb-3')}>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            aria-label="Issue title"
                            placeholder="Issue title"
                            className="h-7 bg-transparent px-0 text-[18px] leading-6 font-semibold text-[lch(100_0_272)] placeholder:text-[lch(63.582_1.375_272)] focus:outline-none"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            aria-label="Issue description"
                            placeholder="Add description..."
                            rows={expanded ? 12 : 3}
                            className={cn(
                                'resize-none bg-transparent px-0 pt-2 text-[15px] leading-5 font-[450] text-[lch(90.895_1.375_272)] placeholder:text-[lch(63.582_1.375_272)] focus:outline-none',
                                expanded ? 'min-h-0 flex-1' : 'h-[82px]',
                            )}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 px-5 pb-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex h-6 items-center gap-1.5 rounded-full bg-[lch(16.091_0.943_272)] px-2 text-xs font-medium text-[lch(90.895_1.375_272)] transition-colors hover:bg-[lch(20_1.1_272)]"
                                >
                                    <StatusIcon status={status} />
                                    {STATUS_META[status].label}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-44">
                                {STATUS_ORDER.map((s) => (
                                    <DropdownMenuItem key={s} className="gap-2 text-[13px]" onSelect={() => setStatus(s)}>
                                        <StatusIcon status={s} />
                                        {STATUS_META[s].label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex h-6 items-center gap-1.5 rounded-full bg-[lch(16.091_0.943_272)] px-2 text-xs font-medium text-[lch(63.582_1.375_272)] transition-colors hover:bg-[lch(20_1.1_272)]"
                                >
                                    <PriorityIcon priority={priority} className="size-3.5" />
                                    {priority === 0 ? 'Priority' : PRIORITY_META.find((p) => p.value === priority)?.label}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-44">
                                {PRIORITY_META.map((p) => (
                                    <DropdownMenuItem key={p.value} className="gap-2 text-[13px]" onSelect={() => setPriority(p.value)}>
                                        <PriorityIcon priority={p.value} className="size-4" />
                                        {p.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                            type="button"
                            aria-label="Change assignee. Currently no one is assigned."
                            className="flex h-6 items-center gap-1.5 rounded-full bg-[lch(16.091_0.943_272)] px-2 text-xs font-medium text-[lch(63.582_1.375_272)] transition-colors hover:bg-[lch(20_1.1_272)]"
                        >
                            <User className="size-3.5" />
                            Assignee
                        </button>
                        {metadata.projects.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex h-6 items-center gap-1.5 rounded-full bg-[lch(16.091_0.943_272)] px-2 text-xs font-medium text-[lch(63.582_1.375_272)] transition-colors hover:bg-[lch(20_1.1_272)]"
                                    >
                                        <Box className="size-3.5" />
                                        {metadata.projects.find((project) => project.id === projectId)?.name ?? 'Project'}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-52">
                                    <DropdownMenuItem className="text-[13px]" onSelect={() => setProjectId(null)}>
                                        No project
                                    </DropdownMenuItem>
                                    {metadata.projects.map((project) => (
                                        <DropdownMenuItem key={project.id} className="text-[13px]" onSelect={() => setProjectId(project.id)}>
                                            {project.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        <button
                            type="button"
                            aria-label="Change labels"
                            className="flex h-6 items-center gap-1.5 rounded-full bg-[lch(16.091_0.943_272)] px-2 text-xs font-medium text-[lch(63.582_1.375_272)] transition-colors hover:bg-[lch(20_1.1_272)]"
                        >
                            <Tag className="size-3.5" />
                            Labels
                        </button>
                        <button
                            type="button"
                            aria-label="More actions"
                            className="flex size-6 items-center justify-center rounded-full bg-[lch(16.091_0.943_272)] text-[lch(90.895_1.375_272)] transition-colors hover:bg-[lch(20_1.1_272)]"
                        >
                            <MoreHorizontal className="size-3.5" />
                        </button>
                    </div>
                    <div className="flex h-14 items-center justify-between border-t border-[lch(22.88_1.83_272)] px-5">
                        <button
                            type="button"
                            aria-label="Attach images, files, or videos"
                            className="flex size-7 items-center justify-center rounded-full bg-[lch(16.091_0.943_272)] text-[lch(90.895_1.375_272)] transition-colors hover:bg-[lch(20_1.1_272)]"
                        >
                            <Paperclip className="size-4" />
                        </button>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-xs font-normal text-[lch(63.582_1.375_272)]">
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={createMore}
                                    data-state={createMore ? 'checked' : 'unchecked'}
                                    onClick={() => setCreateMore((value) => !value)}
                                    className="group flex h-3.5 w-[22px] items-center rounded-full bg-[lch(47.679_0.875_271.999)] p-px transition-colors aria-checked:bg-[lch(47.918_59.303_288.421)]"
                                >
                                    <span className="size-3 rounded-full bg-white transition-transform group-data-[state=checked]:translate-x-2" />
                                </button>
                                Create more
                            </label>
                            <Button
                                type="submit"
                                size="sm"
                                loading={submitting}
                                loadingText="Creating"
                                className="h-7 rounded-full border-0 bg-[lch(47.918_59.303_288.421)] px-3.5 text-xs font-medium text-[lch(100_5_288.421)] shadow-none hover:bg-[lch(55_58_288.421)] disabled:opacity-100"
                                style={{ backgroundColor: 'lch(47.918 59.303 288.421)', color: 'lch(100 5 288.421)' }}
                            >
                                Create issue
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
