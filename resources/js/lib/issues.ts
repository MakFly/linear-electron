import { usePage } from '@inertiajs/react';

export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled';

export interface Issue {
    id: number;
    number: number;
    sort_order: number;
    identifier: string;
    title: string;
    description: string | null;
    status: IssueStatus;
    priority: number;
    assignee: string | null;
    project_id: number | null;
    cycle_id: number | null;
    parent_id: number | null;
    due_date: string | null;
    estimate: number | null;
    started_at: string | null;
    completed_at: string | null;
    created_label: string;
    labels: Label[];
    project: Project | null;
    cycle: Cycle | null;
    parent: IssueSummary | null;
    children: IssueSummary[];
    relations: IssueRelation[];
}

export interface IssueSummary {
    id: number;
    number: number;
    identifier: string;
    title: string;
    status: IssueStatus;
}

export interface Label {
    id: number;
    name: string;
    color: string;
}

export interface Project {
    id: number;
    name: string;
    description: string | null;
    status: string;
    lead: string | null;
    start_date: string | null;
    target_date: string | null;
    icon: string;
    color: string;
    issues_count?: number;
}

export interface Cycle {
    id: number;
    number: number;
    starts_at: string;
    ends_at: string;
    team: string;
}

export interface IssueRelation {
    id: number;
    type: 'blocks' | 'blocked_by' | 'duplicate' | 'relates';
    related_issue: IssueSummary;
}

export interface IssueMetadata {
    labels: Label[];
    projects: Project[];
    cycles: Cycle[];
}

export type IssueView = 'all' | 'active' | 'backlog';

export const STATUS_META: Record<IssueStatus, { label: string; color: string }> = {
    backlog: { label: 'Backlog', color: '#8A8F98' },
    todo: { label: 'Todo', color: '#9EA1A8' },
    in_progress: { label: 'In Progress', color: '#F2C94C' },
    done: { label: 'Done', color: '#5E6AD2' },
    canceled: { label: 'Canceled', color: '#8A8F98' },
};

export const STATUS_ORDER: IssueStatus[] = ['in_progress', 'todo', 'backlog', 'done', 'canceled'];

export const VIEW_STATUSES: Record<IssueView, IssueStatus[]> = {
    all: STATUS_ORDER,
    active: ['in_progress', 'todo'],
    backlog: ['backlog'],
};

export const PRIORITY_META: { value: number; label: string }[] = [
    { value: 0, label: 'No priority' },
    { value: 1, label: 'Urgent' },
    { value: 2, label: 'High' },
    { value: 3, label: 'Medium' },
    { value: 4, label: 'Low' },
];

export const PRIORITY_ORDER_KEY = [0, 1, 2, 3, 4];

// Workspace members (single-user workspace, like the cloned devaubree workspace).
// Falls back to 'kevin' when no user is authenticated (e.g. seeded data).
export const MEMBERS = ['kevin'];

export interface AuthUser {
    name: string;
    email: string;
    avatar?: string | null;
}

export function useAuthUser(): AuthUser | null {
    const page = usePage<{ auth?: { user?: AuthUser | null } }>();
    return page.props.auth?.user ?? null;
}

export function useMembers(): string[] {
    const user = useAuthUser();
    return user?.name ? [user.name] : MEMBERS;
}

export type Grouping = 'status' | 'priority' | 'project' | 'cycle' | 'label' | 'none';
