import { Button } from '@/components/ui/button';
import {
    ConfirmDialog,
    EmptyState,
    RowMenu,
    SearchInput,
    SettingsField,
    SettingsHeader,
    SettingsList,
    SettingsRow,
    SettingsSection,
    TextInput,
} from '@/components/linear/settings/kit';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { Tag, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ProjectLabel {
    id: number;
    name: string;
    color: string;
}

const PRESET_COLORS = [
    '#6366f1', // indigo
    '#f59e0b', // amber
    '#10b981', // emerald
    '#ef4444', // red
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
];

const SEED_LABELS: ProjectLabel[] = [
    { id: 1, name: 'Marketing', color: '#f59e0b' },
    { id: 2, name: 'Design', color: '#8b5cf6' },
    { id: 3, name: 'Engineering', color: '#3b82f6' },
    { id: 4, name: 'Research', color: '#10b981' },
];

let nextId = 10;

export default function ProjectLabels() {
    const { t } = useTranslation();
    const [scope, setScope] = useState<'workspace' | 'team'>('workspace');
    const [search, setSearch] = useState('');
    const [labels, setLabels] = useState<ProjectLabel[]>(SEED_LABELS);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const filtered = labels.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));

    const handleCreate = () => {
        if (!newName.trim()) return;
        setLabels((prev) => [...prev, { id: nextId++, name: newName.trim(), color: newColor }]);
        setNewName('');
        setNewColor(PRESET_COLORS[0]);
        setDialogOpen(false);
    };

    const handleDelete = (id: number) => {
        setLabels((prev) => prev.filter((l) => l.id !== id));
        setDeleteId(null);
    };

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.projectLabels.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.projects')}
                title={t('settings.projectLabels.title')}
                description={t('settings.projectLabels.description')}
                actions={
                    <>
                        <Button variant="outline" size="sm" className="h-7 px-3 text-[13px]">
                            {t('settings.projectLabels.newGroup')}
                        </Button>
                        <Button size="sm" className="h-7 px-3 text-[13px]" onClick={() => setDialogOpen(true)}>
                            <Plus className="mr-1 size-3.5" />
                            {t('settings.projectLabels.newLabel')}
                        </Button>
                    </>
                }
            />

            {/* Scope tabs */}
            <div className="mb-6 flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => setScope('workspace')}
                    className={cn(
                        'h-7 rounded-md px-3 text-[13px] transition-colors',
                        scope === 'workspace'
                            ? 'bg-accent text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {t('settingsCommon.scopeWorkspace')}
                </button>
                <button
                    type="button"
                    onClick={() => setScope('team')}
                    className={cn(
                        'h-7 rounded-md px-3 text-[13px] transition-colors',
                        scope === 'team'
                            ? 'bg-accent text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {t('settingsCommon.scopeTeam')}
                </button>
            </div>

            {/* Search */}
            <div className="mb-4">
                <SearchInput
                    placeholder={t('settingsCommon.search')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            <SettingsSection>
                {filtered.length === 0 ? (
                    <EmptyState
                        icon={Tag}
                        title={t('settings.projectLabels.empty')}
                        description={search ? t('settingsCommon.noResults') : t('settings.projectLabels.emptyDesc')}
                    />
                ) : (
                    <SettingsList>
                        {filtered.map((label) => (
                            <SettingsRow
                                key={label.id}
                                iconNode={
                                    <span
                                        className="size-3 shrink-0 rounded-full"
                                        style={{ backgroundColor: label.color }}
                                    />
                                }
                                title={label.name}
                                control={
                                    <RowMenu
                                        items={[
                                            { label: t('settingsCommon.edit'), onSelect: () => {} },
                                            {
                                                label: t('settingsCommon.delete'),
                                                destructive: true,
                                                separatorBefore: true,
                                                onSelect: () => setDeleteId(label.id),
                                            },
                                        ]}
                                    />
                                }
                            />
                        ))}
                    </SettingsList>
                )}
            </SettingsSection>

            {/* Create dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">{t('settings.projectLabels.dialogTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <SettingsField label={t('settings.projectLabels.nameLabel')} htmlFor="label-name">
                            <TextInput
                                id="label-name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={t('settings.projectLabels.namePlaceholder')}
                            />
                        </SettingsField>
                        <SettingsField label={t('settings.projectLabels.colorLabel')}>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setNewColor(color)}
                                        className={cn(
                                            'size-6 rounded-full transition-all',
                                            newColor === color && 'ring-2 ring-offset-2 ring-primary',
                                        )}
                                        style={{ backgroundColor: color }}
                                        aria-label={color}
                                    />
                                ))}
                            </div>
                        </SettingsField>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
                            {t('settingsCommon.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => { if (!open) setDeleteId(null); }}
                title={t('settings.projectLabels.deleteTitle')}
                description={t('settings.projectLabels.deleteDesc')}
                confirmLabel={t('settingsCommon.delete')}
                onConfirm={() => deleteId !== null && handleDelete(deleteId)}
            />
        </LinearSettingsLayout>
    );
}
