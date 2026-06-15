import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    PlanGate,
    PlanBadge,
    SelectField,
    SettingsHeader,
    SettingsList,
    SettingsRow,
    SettingsSection,
    SettingsField,
    Switch,
    TextInput,
    ToggleRow,
} from '@/components/linear/settings/kit';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type PermissionLevel = 'admins' | 'members' | 'everyone';

interface Permissions {
    invitations: PermissionLevel;
    teamCreation: PermissionLevel;
    workspaceLabels: PermissionLevel;
    workspaceTemplates: PermissionLevel;
    apiKeys: PermissionLevel;
    agentGuidance: PermissionLevel;
    fileUploads: PermissionLevel;
}

const INITIAL_DOMAINS = ['devaubree.dev'];

export default function SecuritySettings() {
    const { t } = useTranslation();

    // Workspace access
    const [inviteLinks, setInviteLinks] = useState(true);
    const [domains, setDomains] = useState<string[]>(INITIAL_DOMAINS);
    const [domainDialogOpen, setDomainDialogOpen] = useState(false);
    const [newDomain, setNewDomain] = useState('');

    // Authentication
    const [authGoogle, setAuthGoogle] = useState(true);
    const [authPasskey, setAuthPasskey] = useState(true);

    // Permissions
    const [permissions, setPermissions] = useState<Permissions>({
        invitations: 'admins',
        teamCreation: 'admins',
        workspaceLabels: 'members',
        workspaceTemplates: 'members',
        apiKeys: 'admins',
        agentGuidance: 'admins',
        fileUploads: 'everyone',
    });

    // Integrations
    const [thirdPartyReview, setThirdPartyReview] = useState(true);
    const [reducePersonalInfo, setReducePersonalInfo] = useState(false);
    const [preventGuestsAgents, setPreventGuestsAgents] = useState(false);

    // AI & Agents
    const [aiTelemetry, setAiTelemetry] = useState(true);
    const [agentWebSearch, setAgentWebSearch] = useState(true);
    const [mcpServers, setMcpServers] = useState(false);

    function setPermission(key: keyof Permissions, value: string) {
        setPermissions((prev) => ({ ...prev, [key]: value as PermissionLevel }));
    }

    function handleAddDomain() {
        const trimmed = newDomain.trim().toLowerCase();
        if (!trimmed) return;
        setDomains((prev) => [...prev, trimmed]);
        setNewDomain('');
        setDomainDialogOpen(false);
        toast.success({ title: t('settings.security.toastDomainAdded') });
    }

    function handleRemoveDomain(domain: string) {
        setDomains((prev) => prev.filter((d) => d !== domain));
        toast.success({ title: t('settings.security.toastDomainRemoved') });
    }

    const permissionOptions: { value: PermissionLevel; label: string }[] = [
        { value: 'admins', label: t('settings.security.optionAdmins') },
        { value: 'members', label: t('settings.security.optionMembers') },
        { value: 'everyone', label: t('settings.security.optionEveryone') },
    ];

    const permissionRows: { key: keyof Permissions; titleKey: string }[] = [
        { key: 'invitations', titleKey: 'settings.security.permInvitations' },
        { key: 'teamCreation', titleKey: 'settings.security.permTeamCreation' },
        { key: 'workspaceLabels', titleKey: 'settings.security.permWorkspaceLabels' },
        { key: 'workspaceTemplates', titleKey: 'settings.security.permWorkspaceTemplates' },
        { key: 'apiKeys', titleKey: 'settings.security.permApiKeys' },
        { key: 'agentGuidance', titleKey: 'settings.security.permAgentGuidance' },
        { key: 'fileUploads', titleKey: 'settings.security.permFileUploads' },
    ];

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.security.title')} />

            <SettingsHeader
                eyebrow={t('settings.navGroups.administration')}
                title={t('settings.security.title')}
                description={t('settings.security.description')}
            />

            {/* ── Workspace access ── */}
            <SettingsSection title={t('settings.security.sectionAccess')}>
                <SettingsList>
                    <ToggleRow
                        title={t('settings.security.inviteLinks')}
                        description={t('settings.security.inviteLinksDesc')}
                        checked={inviteLinks}
                        onCheckedChange={setInviteLinks}
                    />

                    <SettingsRow
                        title={t('settings.security.approvedDomains')}
                        description={t('settings.security.approvedDomainsDesc')}
                    />
                </SettingsList>

                {/* Domain list sub-section */}
                <div className="mt-2 ml-4 space-y-1">
                    {domains.length > 0 && (
                        <SettingsList>
                            {domains.map((domain) => (
                                <SettingsRow
                                    key={domain}
                                    title={domain}
                                    control={
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-[13px] text-destructive hover:text-destructive"
                                            onClick={() => handleRemoveDomain(domain)}
                                            aria-label={t('settings.security.removeDomain')}
                                        >
                                            <X className="size-3.5" />
                                        </Button>
                                    }
                                />
                            ))}
                        </SettingsList>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 px-3 text-[13px]"
                        onClick={() => setDomainDialogOpen(true)}
                    >
                        {t('settings.security.addDomain')}
                    </Button>
                </div>
            </SettingsSection>

            {/* ── Authentication methods ── */}
            <SettingsSection title={t('settings.security.sectionAuth')}>
                <SettingsList>
                    <ToggleRow
                        title={t('settings.security.authGoogle')}
                        description={t('settings.security.authGoogleDesc')}
                        checked={authGoogle}
                        onCheckedChange={setAuthGoogle}
                    />
                    <ToggleRow
                        title={t('settings.security.authPasskey')}
                        description={t('settings.security.authPasskeyDesc')}
                        checked={authPasskey}
                        onCheckedChange={setAuthPasskey}
                    />
                    <SettingsRow
                        title={t('settings.security.authSaml')}
                        description={t('settings.security.authSamlDesc')}
                        control={
                            <div className="flex items-center gap-2">
                                <PlanBadge plan="enterprise" />
                                <Button variant="outline" size="sm" className="h-7 px-3 text-[13px]">
                                    {t('settingsCommon.configure')}
                                </Button>
                            </div>
                        }
                    />
                </SettingsList>
            </SettingsSection>

            {/* ── Workspace management permissions ── */}
            <SettingsSection
                title={t('settings.security.sectionPermissions')}
                description={t('settings.security.permissionsDesc')}
            >
                <SettingsList>
                    {permissionRows.map(({ key, titleKey }) => (
                        <SettingsRow
                            key={key}
                            title={t(titleKey)}
                            control={
                                <SelectField
                                    value={permissions[key]}
                                    onValueChange={(v) => setPermission(key, v)}
                                    options={permissionOptions}
                                    triggerClassName="w-36"
                                />
                            }
                        />
                    ))}
                </SettingsList>
            </SettingsSection>

            {/* ── Integrations & applications ── */}
            <SettingsSection title={t('settings.security.sectionIntegrations')}>
                <SettingsList>
                    <ToggleRow
                        title={t('settings.security.thirdPartyReview')}
                        description={t('settings.security.thirdPartyReviewDesc')}
                        checked={thirdPartyReview}
                        onCheckedChange={setThirdPartyReview}
                    />
                    <ToggleRow
                        title={t('settings.security.reducePersonalInfo')}
                        description={t('settings.security.reducePersonalInfoDesc')}
                        checked={reducePersonalInfo}
                        onCheckedChange={setReducePersonalInfo}
                    />
                    <ToggleRow
                        title={t('settings.security.preventGuestsAgents')}
                        description={t('settings.security.preventGuestsAgentsDesc')}
                        checked={preventGuestsAgents}
                        onCheckedChange={setPreventGuestsAgents}
                    />
                </SettingsList>
            </SettingsSection>

            {/* ── AI & Agents ── */}
            <SettingsSection title={t('settings.security.sectionAi')}>
                <SettingsList>
                    <ToggleRow
                        title={t('settings.security.aiTelemetry')}
                        description={t('settings.security.aiTelemetryDesc')}
                        checked={aiTelemetry}
                        onCheckedChange={setAiTelemetry}
                    />
                    <ToggleRow
                        title={t('settings.security.agentWebSearch')}
                        description={t('settings.security.agentWebSearchDesc')}
                        checked={agentWebSearch}
                        onCheckedChange={setAgentWebSearch}
                    />
                    <ToggleRow
                        title={t('settings.security.mcpServers')}
                        description={t('settings.security.mcpServersDesc')}
                        checked={mcpServers}
                        onCheckedChange={setMcpServers}
                    />
                </SettingsList>
            </SettingsSection>

            {/* ── Compliance ── */}
            <SettingsSection title={t('settings.security.sectionCompliance')}>
                <PlanGate
                    plan="enterprise"
                    icon={ShieldCheck}
                    title={t('settings.security.hipaaTitle')}
                    description={t('settings.security.hipaaDesc')}
                    cta={t('settingsCommon.upgrade')}
                    onAction={() => {}}
                />
            </SettingsSection>

            {/* ── Add domain dialog ── */}
            <Dialog open={domainDialogOpen} onOpenChange={setDomainDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">
                            {t('settings.security.dialogAddDomain')}
                        </DialogTitle>
                        <DialogDescription className="text-[13px]">
                            {t('settings.security.approvedDomainsDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <SettingsField
                            label={t('settings.security.domainLabel')}
                            htmlFor="new-domain"
                        >
                            <TextInput
                                id="new-domain"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                placeholder={t('settings.security.domainPlaceholder')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddDomain();
                                }}
                            />
                        </SettingsField>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setDomainDialogOpen(false);
                                setNewDomain('');
                            }}
                        >
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleAddDomain}
                            disabled={!newDomain.trim()}
                        >
                            {t('settingsCommon.add')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LinearSettingsLayout>
    );
}
