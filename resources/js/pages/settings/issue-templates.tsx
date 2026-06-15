import { Button } from '@/components/ui/button';
import {
    ConfirmDialog,
    EmptyState,
    RowMenu,
    SettingsHeader,
    SettingsList,
    SettingsRow,
    SettingsSection,
    TextInput,
    SettingsField,
} from '@/components/linear/settings/kit';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Template {
    id: number;
    name: string;
    description: string;
}

let nextId = 1;

export default function IssueTemplates() {
    const { t } = useTranslation();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleCreate = () => {
        if (!newName.trim()) return;
        setTemplates((prev) => [...prev, { id: nextId++, name: newName.trim(), description: newDescription.trim() }]);
        setNewName('');
        setNewDescription('');
        setDialogOpen(false);
    };

    const handleDelete = (id: number) => {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        setDeleteId(null);
    };

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.issueTemplates.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.issues')}
                title={t('settings.issueTemplates.title')}
                description={
                    <>
                        {t('settings.issueTemplates.description')}{' '}
                        <a href="#" className="text-primary underline-offset-2 hover:underline text-[13px]">
                            {t('settingsCommon.docs')}
                        </a>
                    </>
                }
                actions={
                    <Button size="sm" className="h-7 px-3 text-[13px]" onClick={() => setDialogOpen(true)}>
                        <Plus className="mr-1 size-3.5" />
                        {t('settings.issueTemplates.newTemplate')}
                    </Button>
                }
            />

            <SettingsSection>
                {templates.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title={t('settings.issueTemplates.empty')}
                        description={t('settings.issueTemplates.emptyDesc')}
                        action={
                            <Button size="sm" className="h-7 px-3 text-[13px]" onClick={() => setDialogOpen(true)}>
                                <Plus className="mr-1 size-3.5" />
                                {t('settings.issueTemplates.newTemplate')}
                            </Button>
                        }
                    />
                ) : (
                    <SettingsList>
                        {templates.map((tpl) => (
                            <SettingsRow
                                key={tpl.id}
                                icon={FileText}
                                title={tpl.name}
                                description={tpl.description || undefined}
                                control={
                                    <RowMenu
                                        items={[
                                            { label: t('settingsCommon.edit'), onSelect: () => {} },
                                            {
                                                label: t('settingsCommon.delete'),
                                                destructive: true,
                                                separatorBefore: true,
                                                onSelect: () => setDeleteId(tpl.id),
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
                        <DialogTitle className="text-[15px]">{t('settings.issueTemplates.dialogTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <SettingsField label={t('settings.issueTemplates.nameLabel')} htmlFor="tpl-name">
                            <TextInput
                                id="tpl-name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={t('settings.issueTemplates.namePlaceholder')}
                            />
                        </SettingsField>
                        <SettingsField label={t('settings.issueTemplates.descLabel')} htmlFor="tpl-desc">
                            <TextInput
                                id="tpl-desc"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder={t('settings.issueTemplates.descPlaceholder')}
                            />
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
                title={t('settings.issueTemplates.deleteTitle')}
                description={t('settings.issueTemplates.deleteDesc')}
                confirmLabel={t('settingsCommon.delete')}
                onConfirm={() => deleteId !== null && handleDelete(deleteId)}
            />
        </LinearSettingsLayout>
    );
}
