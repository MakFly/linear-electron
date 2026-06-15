import { AssigneeAvatar } from '@/components/linear/assignee-avatar';
import { PriorityIcon } from '@/components/linear/priority-icon';
import { Issue, IssueMetadata, PRIORITY_META, useMembers } from '@/lib/issues';
import { cn } from '@/lib/utils';
import { Box, Repeat2, Tag } from 'lucide-react';

export type PanelTab = 'assignees' | 'labels' | 'priority' | 'projects';

const PANEL_TABS: { key: PanelTab; label: string }[] = [
    { key: 'assignees', label: 'Assignees' },
    { key: 'labels', label: 'Labels' },
    { key: 'priority', label: 'Priority' },
    { key: 'projects', label: 'Projects' },
];

/* Linear's exact panel-toggle glyph: rounded frame with the right pane filled (viewBox 0 0 16 16). */
export function PanelToggleIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.25 2C2.45508 2 1 3.45508 1 5.25V10.75C1 12.5449 2.45508 14 4.25 14H11.75C13.5449 14 15 12.5449 15 10.75V5.25C15 3.45508 13.5449 2 11.75 2H4.25ZM2.5 5.5C2.5 4.39543 3.39543 3.5 4.5 3.5H11.5C12.6046 3.5 13.5 4.39543 13.5 5.5V10.5C13.5 11.6046 12.6046 12.5 11.5 12.5H4.5C3.39543 12.5 2.5 11.6046 2.5 10.5V5.5Z"
            />
            <rect x="7" y="5" width="4.5" height="6" rx="1" />
        </svg>
    );
}

/* Linear's exact "No assignee" glyph: a person silhouette ringed by dashes (viewBox 0 0 16 16). */
function NoAssigneeIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 16 16" width="16" height="16" className={className} fill="currentColor" aria-hidden>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.25 6.75C10.25 7.99264 9.24264 9 8 9C6.75736 9 5.75 7.99264 5.75 6.75C5.75 5.50736 6.75736 4.5 8 4.5C9.24264 4.5 10.25 5.50736 10.25 6.75Z"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.5752 10C9.97242 10 11.2611 10.6106 12.1436 11.6143C12.1563 11.5997 12.17 11.586 12.1826 11.5713C12.4518 11.2567 12.9255 11.2202 13.2402 11.4893C13.5548 11.7585 13.5913 12.2321 13.3223 12.5469C13.0953 12.8123 12.8478 13.0593 12.584 13.2881C12.5484 13.3246 12.5106 13.3593 12.4668 13.3887C11.3913 14.2811 10.0437 14.8571 8.56738 14.9756C8.56118 14.9762 8.55508 14.978 8.54883 14.9785C8.51409 14.9812 8.4792 14.9822 8.44434 14.9844C8.38882 14.9879 8.3332 14.991 8.27734 14.9932C8.18529 14.9968 8.09287 15 8 15C7.90681 15 7.81406 14.9968 7.72168 14.9932C7.66583 14.991 7.6102 14.9879 7.55469 14.9844C7.52015 14.9822 7.48558 14.9812 7.45117 14.9785C7.44459 14.978 7.43816 14.9763 7.43164 14.9756C5.94988 14.8564 4.59683 14.2772 3.51953 13.3789C3.50616 13.3677 3.49384 13.3556 3.48145 13.3438C3.47213 13.3365 3.46218 13.33 3.45312 13.3223C3.17492 13.0844 2.91561 12.8251 2.67773 12.5469C2.40865 12.2321 2.44515 11.7585 2.75977 11.4893C3.07452 11.2202 3.54818 11.2567 3.81738 11.5713C3.83028 11.5864 3.84339 11.6013 3.85645 11.6162C4.73898 10.612 6.02721 10.0001 7.4248 10H8.5752ZM7.4248 11.5C6.47086 11.5001 5.59107 11.9168 4.9873 12.6016C5.85267 13.1696 6.88689 13.5 8 13.5C9.11327 13.5 10.1472 13.1687 11.0127 12.6006C10.4088 11.9164 9.52878 11.5 8.5752 11.5H7.4248Z"
            />
            <path d="M1.82715 6.76172C2.24007 6.79385 2.54868 7.15444 2.5166 7.56738C2.50553 7.70999 2.5 7.85427 2.5 8C2.5 8.14573 2.50553 8.29001 2.5166 8.43262C2.54868 8.84556 2.24007 9.20615 1.82715 9.23828C1.41418 9.27036 1.05357 8.9618 1.02148 8.54883C1.00741 8.36759 1 8.18457 1 8C1 7.81543 1.00741 7.63241 1.02148 7.45117C1.05357 7.0382 1.41418 6.72964 1.82715 6.76172Z" />
            <path d="M14.1729 6.76172C14.5858 6.72964 14.9464 7.0382 14.9785 7.45117C14.9926 7.63241 15 7.81543 15 8C15 8.18457 14.9926 8.36759 14.9785 8.54883C14.9464 8.9618 14.5858 9.27036 14.1729 9.23828C13.7599 9.20615 13.4513 8.84556 13.4834 8.43262C13.4945 8.29001 13.5 8.14573 13.5 8C13.5 7.85427 13.4945 7.70999 13.4834 7.56738C13.4513 7.15444 13.7599 6.79385 14.1729 6.76172Z" />
            <path d="M3.45312 2.67773C3.76789 2.40865 4.24155 2.44515 4.51074 2.75977C4.77982 3.07452 4.74329 3.54818 4.42871 3.81738C4.20954 4.00475 4.00475 4.20954 3.81738 4.42871C3.54818 4.74329 3.07452 4.77982 2.75977 4.51074C2.44515 4.24155 2.40865 3.76789 2.67773 3.45312C2.91561 3.17492 3.17492 2.91561 3.45312 2.67773Z" />
            <path d="M11.4893 2.75977C11.7585 2.44515 12.2321 2.40865 12.5469 2.67773C12.8251 2.91561 13.0844 3.17492 13.3223 3.45312C13.5913 3.76789 13.5548 4.24155 13.2402 4.51074C12.9255 4.77982 12.4518 4.74329 12.1826 4.42871C11.9953 4.20954 11.7905 4.00475 11.5713 3.81738C11.2567 3.54818 11.2202 3.07452 11.4893 2.75977Z" />
            <path d="M8 1C8.18457 1 8.36759 1.00741 8.54883 1.02148C8.9618 1.05357 9.27036 1.41418 9.23828 1.82715C9.20615 2.24007 8.84556 2.54868 8.43262 2.5166C8.29001 2.50553 8.14573 2.5 8 2.5C7.85427 2.5 7.70999 2.50553 7.56738 2.5166C7.15444 2.54868 6.79385 2.24007 6.76172 1.82715C6.72964 1.41418 7.0382 1.05357 7.45117 1.02148C7.63241 1.00741 7.81543 1 8 1Z" />
        </svg>
    );
}

interface FacetsPanelProps {
    issues: Issue[];
    tab: PanelTab;
    onTabChange: (tab: PanelTab) => void;
    assigneeFilters: Set<string>;
    onToggleAssignee: (key: string) => void;
    priorityFilters: Set<number>;
    onTogglePriority: (value: number) => void;
    labelFilters: Set<number>;
    onToggleLabel: (value: number) => void;
    projectFilters: Set<number>;
    onToggleProject: (value: number) => void;
    cycleFilters: Set<number>;
    onToggleCycle: (value: number) => void;
    metadata: IssueMetadata;
}

function FacetRow({
    icon,
    label,
    count,
    active,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    count: number;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            data-active={active || undefined}
            className={cn(
                'group/row text-muted-foreground flex h-[42px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] font-[450]',
                'hover:bg-accent/70 data-[active]:bg-primary/15 data-[active]:text-foreground transition-colors duration-100',
            )}
        >
            <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span>
            <span className="truncate">{label}</span>
            {/* "See issues" affordance, revealed on row hover — as in Linear */}
            <span className="ml-auto flex items-center gap-2">
                <span className="text-muted-foreground text-xs opacity-0 transition-opacity duration-100 group-hover/row:opacity-100">
                    See issues
                </span>
                <span className="text-muted-foreground w-5 text-right text-[13px] tabular-nums">{count}</span>
            </span>
        </button>
    );
}

export function FacetsPanel({
    issues,
    tab,
    onTabChange,
    assigneeFilters,
    onToggleAssignee,
    priorityFilters,
    onTogglePriority,
    labelFilters,
    onToggleLabel,
    projectFilters,
    onToggleProject,
    cycleFilters,
    onToggleCycle,
    metadata,
}: FacetsPanelProps) {
    const members = useMembers();
    const unassignedCount = issues.filter((i) => !i.assignee).length;
    const membersWithIssues = members
        .map((member) => ({ member, count: issues.filter((i) => i.assignee === member).length }))
        .filter(({ count, member }) => count > 0 || assigneeFilters.has(member));

    return (
        <div className="mb-2 ml-1 w-[calc(50%+4px)] min-w-[338px] shrink-0 bg-transparent py-0 pr-2">
            <aside className="flex h-full flex-col rounded-[10px] border-[0.5px] border-[#26272b] bg-[#19191b] p-3 shadow-[0_1px_0_rgba(255,255,255,0.025)_inset]">
                {/* Tab pills */}
                <div className="flex h-8 shrink-0 items-center gap-1 rounded-[5px] pb-1">
                    {PANEL_TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => onTabChange(t.key)}
                            className={cn(
                                'flex h-7 items-center justify-center rounded-full border px-4 text-xs font-medium transition-colors duration-100',
                                tab === t.key
                                    ? 'border-[#303136] bg-[#2a2b2f] text-[#f4f4f5]'
                                    : 'text-muted-foreground hover:text-foreground border-[#2a2b2f] bg-[#1b1c1f] hover:border-[#33343a]',
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto pt-2">
                    {tab === 'assignees' && (
                        <>
                            <FacetRow
                                icon={<NoAssigneeIcon className="text-muted-foreground size-4" />}
                                label="No assignee"
                                count={unassignedCount}
                                active={assigneeFilters.has('__none__')}
                                onClick={() => onToggleAssignee('__none__')}
                            />
                            {membersWithIssues.map(({ member, count }) => (
                                <FacetRow
                                    key={member}
                                    icon={<AssigneeAvatar name={member} />}
                                    label={member}
                                    count={count}
                                    active={assigneeFilters.has(member)}
                                    onClick={() => onToggleAssignee(member)}
                                />
                            ))}
                        </>
                    )}

                    {tab === 'labels' &&
                        (metadata.labels.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
                                <Tag className="text-muted-foreground/60 size-5" />
                                <p className="text-muted-foreground text-[13px]">No labels yet</p>
                            </div>
                        ) : (
                            metadata.labels.map((label) => (
                                <FacetRow
                                    key={label.id}
                                    icon={<span className="size-2.5 rounded-full" style={{ backgroundColor: label.color }} />}
                                    label={label.name}
                                    count={issues.filter((issue) => issue.labels.some((current) => current.id === label.id)).length}
                                    active={labelFilters.has(label.id)}
                                    onClick={() => onToggleLabel(label.id)}
                                />
                            ))
                        ))}

                    {tab === 'priority' &&
                        PRIORITY_META.map((p) => (
                            <FacetRow
                                key={p.value}
                                icon={<PriorityIcon priority={p.value} className="size-4" />}
                                label={p.label}
                                count={issues.filter((i) => i.priority === p.value).length}
                                active={priorityFilters.has(p.value)}
                                onClick={() => onTogglePriority(p.value)}
                            />
                        ))}

                    {tab === 'projects' &&
                        (metadata.projects.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
                                <Box className="text-muted-foreground/60 size-5" />
                                <p className="text-muted-foreground text-[13px]">No projects yet</p>
                            </div>
                        ) : (
                            <>
                                {metadata.projects.map((project) => (
                                    <FacetRow
                                        key={project.id}
                                        icon={<span className="size-2.5 rounded-full" style={{ backgroundColor: project.color }} />}
                                        label={project.name}
                                        count={issues.filter((issue) => issue.project_id === project.id).length}
                                        active={projectFilters.has(project.id)}
                                        onClick={() => onToggleProject(project.id)}
                                    />
                                ))}
                                {metadata.cycles.map((cycle) => (
                                    <FacetRow
                                        key={`cycle-${cycle.id}`}
                                        icon={<Repeat2 className="text-muted-foreground size-4" />}
                                        label={`Cycle ${cycle.number}`}
                                        count={issues.filter((issue) => issue.cycle_id === cycle.id).length}
                                        active={cycleFilters.has(cycle.id)}
                                        onClick={() => onToggleCycle(cycle.id)}
                                    />
                                ))}
                            </>
                        ))}
                </div>
            </aside>
        </div>
    );
}
