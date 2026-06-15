import {
    ConfirmDialog,
    RowMenu,
    SettingsField,
    SettingsHeader,
    SettingsList,
    SettingsRow,
    SettingsSection,
    TextInput,
} from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ProjectStatus {
    id: number;
    name: string;
    color: string;
    projectCount: number;
}

const PRESET_COLORS = [
    '#94a3b8', // slate (backlog)
    '#60a5fa', // blue (planned)
    '#f59e0b', // amber (in progress)
    '#10b981', // emerald (completed)
    '#ef4444', // red (canceled)
    '#8b5cf6', // violet
    '#ec4899', // pink
];

const DEFAULT_STATUSES: ProjectStatus[] = [
    { id: 1, name: 'Backlog', color: '#94a3b8', projectCount: 12 },
    { id: 2, name: 'Planned', color: '#60a5fa', projectCount: 5 },
    { id: 3, name: 'In Progress', color: '#f59e0b', projectCount: 8 },
    { id: 4, name: 'Completed', color: '#10b981', projectCount: 34 },
    { id: 5, name: 'Canceled', color: '#ef4444', projectCount: 7 },
];

let nextId = 100;

export default function ProjectStatuses() {
    const { t } = useTranslation();
    const [statuses, setStatuses] = useState<ProjectStatus[]>(DEFAULT_STATUSES);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [renameId, setRenameId] = useState<number | null>(null);
    const [renameName, setRenameName] = useState('');

    const handleCreate = () => {
        if (!newName.trim()) return;
        setStatuses((prev) => [...prev, { id: nextId++, name: newName.trim(), color: newColor, projectCount: 0 }]);
        setNewName('');
        setNewColor(PRESET_COLORS[0]);
        setDialogOpen(false);
    };

    const handleDelete = (id: number) => {
        setStatuses((prev) => prev.filter((s) => s.id !== id));
        setDeleteId(null);
    };

    const openRename = (status: ProjectStatus) => {
        setRenameId(status.id);
        setRenameName(status.name);
    };

    const handleRename = () => {
        if (!renameName.trim()) return;
        setStatuses((prev) => prev.map((s) => (s.id === renameId ? { ...s, name: renameName.trim() } : s)));
        setRenameId(null);
        setRenameName('');
    };

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.projectStatuses.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.projects')}
                title={t('settings.projectStatuses.title')}
                description={t('settings.projectStatuses.description')}
                actions={
                    <Button size="sm" className="h-7 px-3 text-[13px]" onClick={() => setDialogOpen(true)}>
                        <Plus className="mr-1 size-3.5" />
                        {t('settings.projectStatuses.create')}
                    </Button>
                }
            />

            <SettingsSection>
                <SettingsList>
                    {statuses.map((status) => (
                        <SettingsRow
                            key={status.id}
                            iconNode={<span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: status.color }} />}
                            title={status.name}
                            description={t('settings.projectStatuses.projectCount', { count: status.projectCount })}
                            control={
                                <RowMenu
                                    items={[
                                        {
                                            label: t('settings.projectStatuses.rename'),
                                            onSelect: () => openRename(status),
                                        },
                                        {
                                            label: t('settingsCommon.delete'),
                                            destructive: true,
                                            separatorBefore: true,
                                            onSelect: () => setDeleteId(status.id),
                                        },
                                    ]}
                                />
                            }
                        />
                    ))}
                </SettingsList>
            </SettingsSection>

            {/* Create dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">{t('settings.projectStatuses.dialogTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <SettingsField label={t('settings.projectStatuses.nameLabel')} htmlFor="status-name">
                            <TextInput
                                id="status-name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={t('settings.projectStatuses.namePlaceholder')}
                            />
                        </SettingsField>
                        <SettingsField label={t('settings.projectStatuses.colorLabel')}>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setNewColor(color)}
                                        className={cn(
                                            'size-6 rounded-full transition-all',
                                            newColor === color && 'ring-primary ring-2 ring-offset-2',
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

            {/* Rename dialog */}
            <Dialog
                open={renameId !== null}
                onOpenChange={(open) => {
                    if (!open) setRenameId(null);
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">{t('settings.projectStatuses.renameTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <SettingsField label={t('settings.projectStatuses.nameLabel')} htmlFor="status-rename">
                            <TextInput id="status-rename" value={renameName} onChange={(e) => setRenameName(e.target.value)} />
                        </SettingsField>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setRenameId(null)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleRename} disabled={!renameName.trim()}>
                            {t('settingsCommon.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteId(null);
                }}
                title={t('settings.projectStatuses.deleteTitle')}
                description={t('settings.projectStatuses.deleteDesc')}
                confirmLabel={t('settingsCommon.delete')}
                onConfirm={() => deleteId !== null && handleDelete(deleteId)}
            />
        </LinearSettingsLayout>
    );
}
