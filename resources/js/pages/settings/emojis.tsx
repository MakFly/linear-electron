import {
    ConfirmDialog,
    EmptyState,
    RowMenu,
    SearchInput,
    SettingsHeader,
    SettingsSection,
    TextInput,
    settingsDivider,
    settingsSurface,
} from '@/components/linear/settings/kit';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { Smile, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CustomEmoji {
    id: string;
    char: string;
    name: string;
}

const SAMPLE_CHARS = ['🎉', '🚀', '🔥', '✅', '💡', '🎯', '⭐', '🦄', '🐛', '🎨'];

export default function SettingsEmojis() {
    const { t } = useTranslation();
    const [emojis, setEmojis] = useState<CustomEmoji[]>([]);
    const [search, setSearch] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [fileName, setFileName] = useState('');
    const [renameId, setRenameId] = useState<string | null>(null);
    const [renameName, setRenameName] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const filtered = emojis.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()),
    );

    function handleUpload() {
        if (!newName.trim()) return;
        const char = SAMPLE_CHARS[emojis.length % SAMPLE_CHARS.length];
        const emoji: CustomEmoji = {
            id: crypto.randomUUID(),
            char,
            name: newName.trim(),
        };
        setEmojis((prev) => [...prev, emoji]);
        setUploadOpen(false);
        setNewName('');
        setFileName('');
        toast.success({ title: t('settings.emojis.toastUploaded', { name: emoji.name }) });
    }

    function handleRename() {
        if (!renameId || !renameName.trim()) return;
        setEmojis((prev) =>
            prev.map((e) => (e.id === renameId ? { ...e, name: renameName.trim() } : e)),
        );
        setRenameId(null);
        setRenameName('');
        toast.success({ title: t('settings.emojis.toastRenamed') });
    }

    function handleDelete(id: string) {
        setEmojis((prev) => prev.filter((e) => e.id !== id));
        toast.success({ title: t('settings.emojis.toastDeleted') });
    }

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.emojis.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.features')}
                title={t('settings.emojis.title')}
                description={t('settings.emojis.description')}
                actions={
                    <Button
                        size="sm"
                        className="h-7 px-3 text-[13px]"
                        onClick={() => setUploadOpen(true)}
                    >
                        <Upload className="mr-1.5 size-3.5" />
                        {t('settings.emojis.uploadButton')}
                    </Button>
                }
            />

            <SettingsSection>
                <SearchInput
                    className="mb-4 max-w-xs"
                    placeholder={t('settings.emojis.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {emojis.length === 0 || filtered.length === 0 ? (
                    <EmptyState
                        icon={Smile}
                        title={t('settings.emojis.emptyTitle')}
                        description={
                            emojis.length === 0
                                ? t('settings.emojis.emptyDesc')
                                : t('settings.emojis.emptyFilterDesc')
                        }
                        action={
                            emojis.length === 0 ? (
                                <Button
                                    size="sm"
                                    className="h-7 px-3 text-[13px]"
                                    onClick={() => setUploadOpen(true)}
                                >
                                    {t('settings.emojis.uploadButton')}
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <div className={cn(settingsSurface, 'overflow-hidden')}>
                        {filtered.map((emoji) => (
                            <div
                                key={emoji.id}
                                className={cn(settingsDivider, 'flex min-h-[46px] items-center gap-3 border-b px-4 py-2 last:border-b-0')}
                            >
                                <span className="text-[20px] leading-none">{emoji.char}</span>
                                <div className="flex-1">
                                    <span className="text-[13px] font-medium">:{emoji.name}:</span>
                                </div>
                                <RowMenu
                                    items={[
                                        {
                                            label: t('settingsCommon.rename'),
                                            onSelect: () => {
                                                setRenameId(emoji.id);
                                                setRenameName(emoji.name);
                                            },
                                        },
                                        {
                                            label: t('settingsCommon.delete'),
                                            destructive: true,
                                            separatorBefore: true,
                                            onSelect: () => setDeleteId(emoji.id),
                                        },
                                    ]}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </SettingsSection>

            {/* Upload dialog */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">
                            {t('settings.emojis.uploadDialogTitle')}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-1">
                        <div>
                            <label className="mb-1.5 block text-[13px] font-medium">
                                {t('settings.emojis.nameLabel')}
                            </label>
                            <TextInput
                                placeholder={t('settings.emojis.namePlaceholder')}
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpload()}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[13px] font-medium">
                                {t('settings.emojis.fileLabel')}
                            </label>
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="border-border/80 hover:bg-muted/40 flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-[13px] transition-colors"
                            >
                                <Upload className="text-muted-foreground size-4" />
                                <span className="text-muted-foreground">
                                    {fileName || t('settings.emojis.filePlaceholder')}
                                </span>
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/png,image/gif,image/jpeg"
                                className="hidden"
                                onChange={(e) =>
                                    setFileName(e.target.files?.[0]?.name ?? '')
                                }
                            />
                            <p className="text-muted-foreground mt-1.5 text-[12px]">
                                {t('settings.emojis.fileHint')}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="mt-2 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setUploadOpen(false);
                                setNewName('');
                                setFileName('');
                            }}
                        >
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button
                            size="sm"
                            disabled={!newName.trim()}
                            onClick={handleUpload}
                        >
                            {t('settings.emojis.uploadButton')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rename dialog */}
            <Dialog open={renameId !== null} onOpenChange={(o) => !o && setRenameId(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">
                            {t('settings.emojis.renameDialogTitle')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-1">
                        <TextInput
                            value={renameName}
                            onChange={(e) => setRenameName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        />
                    </div>
                    <DialogFooter className="mt-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => setRenameId(null)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" disabled={!renameName.trim()} onClick={handleRename}>
                            {t('settingsCommon.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(o) => !o && setDeleteId(null)}
                title={t('settings.emojis.deleteDialogTitle')}
                description={t('settings.emojis.deleteDialogDesc')}
                confirmLabel={t('settingsCommon.delete')}
                onConfirm={() => {
                    if (deleteId) handleDelete(deleteId);
                    setDeleteId(null);
                }}
            />
        </LinearSettingsLayout>
    );
}
