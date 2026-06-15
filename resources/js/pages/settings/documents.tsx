import { Button } from '@/components/ui/button';
import {
    EmptyState,
    RowMenu,
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
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DocumentTemplate {
    id: number;
    name: string;
    description: string;
}

let nextId = 1;

export default function Documents() {
    const { t } = useTranslation();
    const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const handleCreate = () => {
        if (!newName.trim()) return;
        setTemplates((prev) => [
            ...prev,
            { id: nextId++, name: newName.trim(), description: newDescription.trim() },
        ]);
        setNewName('');
        setNewDescription('');
        setDialogOpen(false);
    };

    const handleDelete = (id: number) => {
        setTemplates((prev) => prev.filter((tpl) => tpl.id !== id));
    };

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.documents.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.features')}
                title={t('settings.documents.title')}
                description={
                    <>
                        {t('settings.documents.description')}{' '}
                        <a href="#" className="text-primary underline-offset-2 hover:underline text-[13px]">
                            {t('settingsCommon.docs')}
                        </a>
                    </>
                }
                actions={
                    <Button size="sm" className="h-7 px-3 text-[13px]" onClick={() => setDialogOpen(true)}>
                        <Plus className="mr-1 size-3.5" />
                        {t('settings.documents.templates.newBtn')}
                    </Button>
                }
            />

            <SettingsSection title={t('settings.documents.sections.templates')}>
                {templates.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title={t('settings.documents.templates.emptyTitle')}
                        description={t('settings.documents.templates.emptyDesc')}
                        action={
                            <Button size="sm" className="h-7 px-3 text-[13px]" onClick={() => setDialogOpen(true)}>
                                <Plus className="mr-1 size-3.5" />
                                {t('settings.documents.templates.newBtn')}
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
                                                onSelect: () => handleDelete(tpl.id),
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
                        <DialogTitle className="text-[15px]">
                            {t('settings.documents.templates.dialogTitle')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <SettingsField label={t('settings.documents.templates.nameLabel')} htmlFor="doc-tpl-name">
                            <TextInput
                                id="doc-tpl-name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={t('settings.documents.templates.namePlaceholder')}
                            />
                        </SettingsField>
                        <SettingsField label={t('settings.documents.templates.descLabel')} htmlFor="doc-tpl-desc">
                            <TextInput
                                id="doc-tpl-desc"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder={t('settings.documents.templates.descPlaceholder')}
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
        </LinearSettingsLayout>
    );
}
