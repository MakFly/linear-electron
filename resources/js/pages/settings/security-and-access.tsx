import {
    ConfirmDialog,
    EmptyState,
    RowMenu,
    SettingsHeader,
    SettingsSection,
    SettingsList,
    SettingsRow,
    SettingsField,
    StatusPill,
    TextInput,
} from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { AppWindow, Key, KeyRound, Monitor } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Session {
    id: string;
    name: string;
    detail: string;
    current?: boolean;
}

interface ApiKey {
    id: string;
    name: string;
    maskedKey: string;
    createdAt: string;
}

const INITIAL_SESSIONS: Session[] = [
    { id: '1', name: 'Chrome on macOS', detail: 'Paris, France', current: true },
    { id: '2', name: 'Firefox on Windows', detail: 'Last seen 2 days ago' },
    { id: '3', name: 'Safari on iPhone', detail: 'Last seen 5 days ago' },
];

const INITIAL_API_KEYS: ApiKey[] = [
    { id: '1', name: 'My personal key', maskedKey: 'lin_api_••••••••a1b2', createdAt: '2024-01-15' },
];

export default function SettingsSecurityAndAccess() {
    const { t } = useTranslation();

    const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
    const [revokeAllOpen, setRevokeAllOpen] = useState(false);
    const [newKeyOpen, setNewKeyOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);

    function revokeSession(id: string) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        toast.success({ title: t('settings.securityAccessPage.sessions.revokedSession') });
    }

    function revokeAllSessions() {
        setSessions((prev) => prev.filter((s) => s.current));
        toast.success({ title: t('settings.securityAccessPage.sessions.revokedAll') });
    }

    function createApiKey() {
        if (!newKeyName.trim()) return;
        const suffix = Math.random().toString(36).slice(-4);
        const newKey: ApiKey = {
            id: Date.now().toString(),
            name: newKeyName.trim(),
            maskedKey: `lin_api_••••••••${suffix}`,
            createdAt: new Date().toISOString().split('T')[0],
        };
        setApiKeys((prev) => [...prev, newKey]);
        setNewKeyName('');
        setNewKeyOpen(false);
        toast.success({ title: t('settings.securityAccessPage.apiKeys.created') });
    }

    function revokeApiKey(id: string) {
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
        toast.success({ title: t('settings.securityAccessPage.apiKeys.revoked') });
    }

    function copyApiKey(maskedKey: string) {
        navigator.clipboard.writeText(maskedKey).catch(() => {});
        toast.success({ title: t('settingsCommon.copied') });
    }

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.securityAccessPage.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.personal')}
                title={t('settings.securityAccessPage.title')}
                description={t('settings.securityAccessPage.description')}
            />

            {/* Sessions */}
            <SettingsSection
                title={t('settings.securityAccessPage.sessions.title')}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/40 h-7 px-3 text-[13px]"
                        onClick={() => setRevokeAllOpen(true)}
                    >
                        {t('settings.securityAccessPage.sessions.revokeAll')}
                    </Button>
                }
            >
                <SettingsList>
                    {sessions.map((session) => (
                        <SettingsRow
                            key={session.id}
                            iconNode={<Monitor className="text-muted-foreground size-4 shrink-0" />}
                            title={session.name}
                            description={session.detail}
                            control={
                                session.current ? (
                                    <>
                                        <StatusPill
                                            on={true}
                                            onLabel={t('settings.securityAccessPage.sessions.currentSession')}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-3 text-[13px]"
                                        >
                                            {t('settings.securityAccessPage.sessions.logOut')}
                                        </Button>
                                    </>
                                ) : (
                                    session.id === '3' ? (
                                        <RowMenu
                                            items={[
                                                {
                                                    label: t('settingsCommon.revoke'),
                                                    destructive: true,
                                                    onSelect: () => revokeSession(session.id),
                                                },
                                            ]}
                                        />
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive border-destructive/40 h-7 px-3 text-[13px]"
                                            onClick={() => revokeSession(session.id)}
                                        >
                                            {t('settingsCommon.revoke')}
                                        </Button>
                                    )
                                )
                            }
                        />
                    ))}
                </SettingsList>
            </SettingsSection>

            <ConfirmDialog
                open={revokeAllOpen}
                onOpenChange={setRevokeAllOpen}
                title={t('settings.securityAccessPage.sessions.revokeAllTitle')}
                description={t('settings.securityAccessPage.sessions.revokeAllDescription')}
                confirmLabel={t('settingsCommon.revokeAll')}
                onConfirm={revokeAllSessions}
            />

            {/* Passkeys */}
            <SettingsSection
                title={t('settings.securityAccessPage.passkeys.title')}
                actions={
                    <Button size="sm" className="h-7 px-3 text-[13px]">
                        {t('settings.securityAccessPage.passkeys.newPasskey')}
                    </Button>
                }
            >
                <EmptyState
                    icon={KeyRound}
                    title={t('settings.securityAccessPage.passkeys.emptyTitle')}
                    description={t('settings.securityAccessPage.passkeys.emptyDescription')}
                    action={
                        <Button size="sm" className="h-7 px-3 text-[13px]">
                            {t('settings.securityAccessPage.passkeys.createPasskey')}
                        </Button>
                    }
                />
            </SettingsSection>

            {/* Personal API keys */}
            <SettingsSection
                title={t('settings.securityAccessPage.apiKeys.title')}
                actions={
                    <Button size="sm" className="h-7 px-3 text-[13px]" onClick={() => setNewKeyOpen(true)}>
                        {t('settings.securityAccessPage.apiKeys.newApiKey')}
                    </Button>
                }
            >
                {apiKeys.length === 0 ? (
                    <EmptyState
                        icon={Key}
                        title={t('settings.securityAccessPage.apiKeys.emptyTitle')}
                        description={t('settings.securityAccessPage.apiKeys.emptyDescription')}
                        action={
                            <Button size="sm" className="h-7 px-3 text-[13px]" onClick={() => setNewKeyOpen(true)}>
                                {t('settings.securityAccessPage.apiKeys.createApiKey')}
                            </Button>
                        }
                    />
                ) : (
                    <SettingsList>
                        {apiKeys.map((apiKey) => (
                            <SettingsRow
                                key={apiKey.id}
                                icon={Key}
                                title={apiKey.name}
                                description={apiKey.maskedKey}
                                control={
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-3 text-[13px]"
                                            onClick={() => copyApiKey(apiKey.maskedKey)}
                                        >
                                            {t('settings.securityAccessPage.apiKeys.copy')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive border-destructive/40 h-7 px-3 text-[13px]"
                                            onClick={() => revokeApiKey(apiKey.id)}
                                        >
                                            {t('settingsCommon.revoke')}
                                        </Button>
                                    </>
                                }
                            />
                        ))}
                    </SettingsList>
                )}
            </SettingsSection>

            {/* Authorized applications */}
            <SettingsSection title={t('settings.securityAccessPage.authorizedApps.title')}>
                <EmptyState
                    icon={AppWindow}
                    title={t('settings.securityAccessPage.authorizedApps.emptyTitle')}
                    description={t('settings.securityAccessPage.authorizedApps.emptyDescription')}
                />
            </SettingsSection>

            {/* New API key dialog */}
            <Dialog open={newKeyOpen} onOpenChange={setNewKeyOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">
                            {t('settings.securityAccessPage.apiKeys.dialogTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-[13px]">
                            {t('settings.securityAccessPage.apiKeys.dialogDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <SettingsField label={t('settings.securityAccessPage.apiKeys.nameLabel')} htmlFor="api-key-name">
                        <TextInput
                            id="api-key-name"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder={t('settings.securityAccessPage.apiKeys.namePlaceholder')}
                            onKeyDown={(e) => { if (e.key === 'Enter') createApiKey(); }}
                        />
                    </SettingsField>
                    <DialogFooter className="mt-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setNewKeyOpen(false); setNewKeyName(''); }}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={createApiKey} disabled={!newKeyName.trim()}>
                            {t('settingsCommon.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LinearSettingsLayout>
    );
}
