import { Button } from '@/components/ui/button';
import {
    ConfirmDialog,
    EmptyState,
    RowMenu,
    SearchInput,
    SelectField,
    SettingsHeader,
    SettingsSection,
    TextInput,
    settingsDivider,
    settingsSurface,
} from '@/components/linear/settings/kit';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Team {
    id: number;
    name: string;
    identifier: string;
    color: string;
    visibility: 'Public' | 'Private';
    members: number;
    issues: number;
    created: string;
    archived?: boolean;
}

const SEED_TEAMS: Team[] = [
    { id: 1, name: 'Devaubree', identifier: 'DEV', color: '#5E6AD2', visibility: 'Public', members: 8, issues: 34, created: 'Jan 2024' },
    { id: 2, name: 'Design', identifier: 'DSG', color: '#10B981', visibility: 'Public', members: 3, issues: 12, created: 'Feb 2024' },
    { id: 3, name: 'Product', identifier: 'PRD', color: '#F59E0B', visibility: 'Private', members: 5, issues: 21, created: 'Mar 2024' },
    { id: 4, name: 'Infrastructure', identifier: 'INF', color: '#EF4444', visibility: 'Private', members: 2, issues: 7, created: 'Apr 2024', archived: true },
];

let nextId = 100;

export default function SettingsTeams() {
    const { t } = useTranslation();

    const [teams, setTeams] = useState<Team[]>(SEED_TEAMS);
    const [statusFilter, setStatusFilter] = useState('active');
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newIdentifier, setNewIdentifier] = useState('');
    const [deleteTeamId, setDeleteTeamId] = useState<number | null>(null);

    const filteredTeams = teams.filter((team) => {
        const matchesStatus =
            statusFilter === 'all'
                ? true
                : statusFilter === 'archived'
                  ? team.archived === true
                  : !team.archived;
        const matchesSearch =
            search.trim() === '' || team.name.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleCreate = () => {
        if (!newName.trim()) return;
        const newTeam: Team = {
            id: nextId++,
            name: newName.trim(),
            identifier: newIdentifier.trim().toUpperCase() || newName.slice(0, 3).toUpperCase(),
            color: '#8B5CF6',
            visibility: 'Public',
            members: 1,
            issues: 0,
            created: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        };
        setTeams((prev) => [...prev, newTeam]);
        setNewName('');
        setNewIdentifier('');
        setCreateOpen(false);
    };

    const handleDelete = (id: number) => {
        setTeams((prev) => prev.filter((team) => team.id !== id));
        toast.success({ title: t('settings.teams.toastDeleted') });
    };

    const statusOptions = [
        { value: 'active', label: t('settings.teams.statusActive') },
        { value: 'archived', label: t('settings.teams.statusArchived') },
        { value: 'all', label: t('settings.teams.statusAll') },
    ];

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.teams.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.administration')}
                title={t('settings.teams.title')}
                description={t('settings.teams.description')}
                actions={
                    <>
                        <SelectField
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                            options={statusOptions}
                            triggerClassName="w-32"
                        />
                        <SearchInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('settingsCommon.filterByName')}
                            className="w-52"
                        />
                        <Button size="sm" className="h-7 px-3 text-[13px]" onClick={() => setCreateOpen(true)}>
                            {t('settings.teams.createTeam')}
                        </Button>
                    </>
                }
            />

            <SettingsSection>
                {filteredTeams.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title={t('settings.teams.emptyTitle')}
                        description={t('settings.teams.emptyDesc')}
                    />
                ) : (
                    <div className={cn(settingsSurface, 'overflow-hidden')}>
                        {/* Header row */}
                        <div className={cn(settingsDivider, 'bg-muted/30 grid grid-cols-[2fr_1fr_80px_80px_120px_40px] items-center gap-3 border-b px-4 py-2 text-[12px] text-muted-foreground')}>
                            <span>{t('settings.teams.columnName')}</span>
                            <span>{t('settings.teams.columnVisibility')}</span>
                            <span>{t('settings.teams.columnMembers')}</span>
                            <span>{t('settings.teams.columnIssues')}</span>
                            <span>{t('settings.teams.columnCreated')}</span>
                            <span />
                        </div>
                        {/* Body rows */}
                        {filteredTeams.map((team) => (
                            <div
                                key={team.id}
                                className={cn(settingsDivider, 'grid grid-cols-[2fr_1fr_80px_80px_120px_40px] min-h-[46px] items-center gap-3 border-b px-4 last:border-b-0 text-[13px]')}
                            >
                                {/* Name */}
                                <div className="flex min-w-0 items-center gap-2">
                                    <span
                                        className="size-4 shrink-0 rounded-sm"
                                        style={{ backgroundColor: team.color }}
                                    />
                                    <span className="truncate font-medium">{team.name}</span>
                                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                                        {team.identifier}
                                    </span>
                                </div>
                                {/* Visibility */}
                                <span className="text-muted-foreground">
                                    {team.visibility === 'Public'
                                        ? t('settings.teams.visibilityPublic')
                                        : t('settings.teams.visibilityPrivate')}
                                </span>
                                {/* Members */}
                                <span className="text-muted-foreground">{team.members}</span>
                                {/* Issues */}
                                <span className="text-muted-foreground">{team.issues}</span>
                                {/* Created */}
                                <span className="text-muted-foreground">{team.created}</span>
                                {/* Actions */}
                                <RowMenu
                                    items={[
                                        { label: t('settings.teams.menuSettings'), onSelect: () => {} },
                                        { label: t('settings.teams.menuLeave'), onSelect: () => {} },
                                        {
                                            label: t('settings.teams.menuDelete'),
                                            destructive: true,
                                            separatorBefore: true,
                                            onSelect: () => setDeleteTeamId(team.id),
                                        },
                                    ]}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </SettingsSection>

            {/* Create team dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">{t('settings.teams.dialogTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-1">
                        <div>
                            <label className="mb-1.5 block text-[13px] font-medium">
                                {t('settings.teams.teamName')}
                            </label>
                            <TextInput
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Engineering"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[13px] font-medium">
                                {t('settings.teams.identifier')}
                            </label>
                            <TextInput
                                value={newIdentifier}
                                onChange={(e) => setNewIdentifier(e.target.value)}
                                placeholder="e.g. ENG"
                                maxLength={5}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
                            {t('settingsCommon.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm dialog */}
            <ConfirmDialog
                open={deleteTeamId !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteTeamId(null);
                }}
                title={t('settings.teams.deleteTitle')}
                description={t('settings.teams.deleteDesc')}
                confirmLabel={t('settingsCommon.delete')}
                onConfirm={() => {
                    if (deleteTeamId !== null) handleDelete(deleteTeamId);
                }}
            />
        </LinearSettingsLayout>
    );
}
