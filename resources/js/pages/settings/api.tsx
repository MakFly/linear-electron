import {
    EmptyState,
    SelectField,
    SettingsField,
    SettingsHeader,
    SettingsSection,
    TextInput,
    settingsDivider,
    settingsSurface,
} from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { BookOpen, Key, PlugZap, Webhook } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface OAuthApp {
    id: string;
    name: string;
    redirectUrl: string;
}

interface WebhookEntry {
    id: string;
    url: string;
    events: string[];
}

interface ApiKey {
    id: string;
    name: string;
}

export default function SettingsApi() {
    const { t } = useTranslation();

    // OAuth applications
    const [oauthApps, setOauthApps] = useState<OAuthApp[]>([]);
    const [oauthDialogOpen, setOauthDialogOpen] = useState(false);
    const [oauthName, setOauthName] = useState('');
    const [oauthRedirect, setOauthRedirect] = useState('');

    // Webhooks
    const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
    const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookEventIssue, setWebhookEventIssue] = useState(false);
    const [webhookEventComment, setWebhookEventComment] = useState(false);
    const [webhookEventProject, setWebhookEventProject] = useState(false);

    // API keys
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
    const [apiKeyName, setApiKeyName] = useState('');
    const [apiKeyPermission, setApiKeyPermission] = useState('admins');

    const handleCreateOAuth = () => {
        if (!oauthName.trim()) return;
        setOauthApps((prev) => [...prev, { id: Date.now().toString(), name: oauthName.trim(), redirectUrl: oauthRedirect.trim() }]);
        setOauthName('');
        setOauthRedirect('');
        setOauthDialogOpen(false);
        toast.success({ title: oauthName.trim() + ' created' });
    };

    const handleCreateWebhook = () => {
        if (!webhookUrl.trim()) return;
        const events: string[] = [];
        if (webhookEventIssue) events.push('issue');
        if (webhookEventComment) events.push('comment');
        if (webhookEventProject) events.push('project');
        setWebhooks((prev) => [...prev, { id: Date.now().toString(), url: webhookUrl.trim(), events }]);
        setWebhookUrl('');
        setWebhookEventIssue(false);
        setWebhookEventComment(false);
        setWebhookEventProject(false);
        setWebhookDialogOpen(false);
        toast.success({ title: 'Webhook created' });
    };

    const handleCreateApiKey = () => {
        if (!apiKeyName.trim()) return;
        setApiKeys((prev) => [...prev, { id: Date.now().toString(), name: apiKeyName.trim() }]);
        setApiKeyName('');
        setApiKeyDialogOpen(false);
        toast.success({ title: apiKeyName.trim() + ' created' });
    };

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.api.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.administration')}
                title={t('settings.api.title')}
                description={t('settings.api.description')}
            />

            {/* GraphQL docs + Slack community */}
            <SettingsSection>
                <div className="flex flex-col gap-1">
                    <button
                        type="button"
                        className="text-primary flex w-fit items-center gap-1.5 text-[13px] hover:underline"
                        onClick={() => toast.info({ title: t('settings.api.docsLink') })}
                    >
                        <BookOpen className="size-3.5" />
                        {t('settings.api.docsLink')}
                    </button>
                    <button
                        type="button"
                        className="text-primary flex w-fit items-center gap-1.5 text-[13px] hover:underline"
                        onClick={() => toast.info({ title: t('settings.api.slackToast') })}
                    >
                        <PlugZap className="size-3.5" />
                        {t('settings.api.slackCommunityLink')}
                    </button>
                </div>
            </SettingsSection>

            {/* OAuth applications */}
            <SettingsSection
                title={t('settings.api.oauthApps')}
                description={t('settings.api.oauthAppsDescription')}
                actions={
                    <Button size="sm" className="h-7 px-3 text-[13px]" onClick={() => setOauthDialogOpen(true)}>
                        {t('settings.api.newOAuthApp')}
                    </Button>
                }
            >
                {oauthApps.length === 0 ? (
                    <EmptyState icon={PlugZap} title={t('settings.api.oauthEmptyTitle')} description={t('settings.api.oauthEmptyDescription')} />
                ) : (
                    <div className={cn(settingsSurface, 'overflow-hidden')}>
                        {oauthApps.map((app) => (
                            <div
                                key={app.id}
                                className={cn(settingsDivider, 'flex min-h-[46px] items-center gap-3 border-b px-4 py-2 last:border-b-0')}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-[13px] font-medium">{app.name}</div>
                                    <div className="text-muted-foreground truncate text-[12px]">{app.redirectUrl}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SettingsSection>

            {/* Webhooks */}
            <SettingsSection
                title={t('settings.api.webhooks')}
                description={t('settings.api.webhooksDescription')}
                actions={
                    <Button size="sm" className="h-7 px-3 text-[13px]" onClick={() => setWebhookDialogOpen(true)}>
                        {t('settings.api.newWebhook')}
                    </Button>
                }
            >
                {webhooks.length === 0 ? (
                    <EmptyState icon={Webhook} title={t('settings.api.webhookEmptyTitle')} description={t('settings.api.webhookEmptyDescription')} />
                ) : (
                    <div className={cn(settingsSurface, 'overflow-hidden')}>
                        {webhooks.map((wh) => (
                            <div
                                key={wh.id}
                                className={cn(settingsDivider, 'flex min-h-[46px] items-center gap-3 border-b px-4 py-2 last:border-b-0')}
                            >
                                <Webhook className="text-muted-foreground size-4 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-[13px] font-medium">{wh.url}</div>
                                    <div className="text-muted-foreground text-[12px]">{wh.events.join(', ')}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SettingsSection>

            {/* Personal API keys */}
            <SettingsSection
                title={t('settings.api.personalApiKeys')}
                description={t('settings.api.personalApiKeysDescription')}
                actions={
                    <Button size="sm" className="h-7 px-3 text-[13px]" onClick={() => setApiKeyDialogOpen(true)}>
                        {t('settings.api.createApiKey')}
                    </Button>
                }
            >
                {apiKeys.length === 0 ? (
                    <EmptyState icon={Key} title={t('settings.api.apiKeyEmptyTitle')} description={t('settings.api.apiKeyEmptyDescription')} />
                ) : (
                    <div className={cn(settingsSurface, 'overflow-hidden')}>
                        {apiKeys.map((key) => (
                            <div
                                key={key.id}
                                className={cn(settingsDivider, 'flex min-h-[46px] items-center gap-3 border-b px-4 py-2 last:border-b-0')}
                            >
                                <Key className="text-muted-foreground size-4 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-[13px] font-medium">{key.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6">
                    <SettingsField label={t('settings.api.apiKeyPermissionLabel')} description={t('settings.api.apiKeyPermissionDescription')}>
                        <SelectField
                            value={apiKeyPermission}
                            onValueChange={setApiKeyPermission}
                            triggerClassName="max-w-xs"
                            options={[
                                { value: 'admins', label: t('settings.api.permissionAdmins') },
                                { value: 'members', label: t('settings.api.permissionMembers') },
                            ]}
                        />
                    </SettingsField>
                </div>
            </SettingsSection>

            {/* OAuth Dialog */}
            <Dialog open={oauthDialogOpen} onOpenChange={setOauthDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">{t('settings.api.oauthDialogTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-1">
                        <SettingsField label={t('settings.api.oauthNameLabel')} htmlFor="oauth-name">
                            <TextInput
                                id="oauth-name"
                                value={oauthName}
                                onChange={(e) => setOauthName(e.target.value)}
                                placeholder={t('settings.api.oauthNamePlaceholder')}
                            />
                        </SettingsField>
                        <SettingsField label={t('settings.api.oauthRedirectLabel')} htmlFor="oauth-redirect">
                            <TextInput
                                id="oauth-redirect"
                                value={oauthRedirect}
                                onChange={(e) => setOauthRedirect(e.target.value)}
                                placeholder={t('settings.api.oauthRedirectPlaceholder')}
                            />
                        </SettingsField>
                    </div>
                    <DialogFooter className="mt-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => setOauthDialogOpen(false)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleCreateOAuth}>
                            {t('settingsCommon.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Webhook Dialog */}
            <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">{t('settings.api.webhookDialogTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-1">
                        <SettingsField label={t('settings.api.webhookUrlLabel')} htmlFor="webhook-url">
                            <TextInput
                                id="webhook-url"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                placeholder={t('settings.api.webhookUrlPlaceholder')}
                            />
                        </SettingsField>
                        <SettingsField label={t('settings.api.webhookEventsLabel')}>
                            <div className="space-y-2">
                                <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                                    <input
                                        type="checkbox"
                                        checked={webhookEventIssue}
                                        onChange={(e) => setWebhookEventIssue(e.target.checked)}
                                        className="rounded"
                                    />
                                    {t('settings.api.webhookEventIssue')}
                                </label>
                                <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                                    <input
                                        type="checkbox"
                                        checked={webhookEventComment}
                                        onChange={(e) => setWebhookEventComment(e.target.checked)}
                                        className="rounded"
                                    />
                                    {t('settings.api.webhookEventComment')}
                                </label>
                                <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                                    <input
                                        type="checkbox"
                                        checked={webhookEventProject}
                                        onChange={(e) => setWebhookEventProject(e.target.checked)}
                                        className="rounded"
                                    />
                                    {t('settings.api.webhookEventProject')}
                                </label>
                            </div>
                        </SettingsField>
                    </div>
                    <DialogFooter className="mt-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => setWebhookDialogOpen(false)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleCreateWebhook}>
                            {t('settingsCommon.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* API Key Dialog */}
            <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">{t('settings.api.apiKeyDialogTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-1">
                        <SettingsField label={t('settings.api.apiKeyNameLabel')} htmlFor="api-key-name">
                            <TextInput
                                id="api-key-name"
                                value={apiKeyName}
                                onChange={(e) => setApiKeyName(e.target.value)}
                                placeholder={t('settings.api.apiKeyNamePlaceholder')}
                            />
                        </SettingsField>
                    </div>
                    <DialogFooter className="mt-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => setApiKeyDialogOpen(false)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleCreateApiKey}>
                            {t('settingsCommon.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LinearSettingsLayout>
    );
}
