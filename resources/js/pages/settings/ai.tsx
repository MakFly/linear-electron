import {
    EmptyState,
    PlanGate,
    SettingsHeader,
    SettingsList,
    SettingsRow,
    SettingsSection,
    StatusPill,
    ToggleRow,
} from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { Bot, Boxes } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsAi() {
    const { t } = useTranslation();

    const [agentEnabled, setAgentEnabled] = useState(true);
    const [agentAutomations, setAgentAutomations] = useState(false);
    const [codeIntelligence, setCodeIntelligence] = useState(true);
    const [triageIntelligence, setTriageIntelligence] = useState(false);
    const [threadSummaries, setThreadSummaries] = useState(false);

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.aiAgents.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.features')}
                title={t('settings.aiAgents.title')}
                description={t('settings.aiAgents.description')}
            />

            {/* AI usage & credits */}
            <SettingsSection title={t('settings.aiAgents.sections.usageCredits')}>
                <PlanGate plan="business" description={t('settings.aiAgents.planGate.description')} />
            </SettingsSection>

            {/* Linear Agent */}
            <SettingsSection title={t('settings.aiAgents.sections.linearAgent')}>
                <SettingsList>
                    <ToggleRow
                        icon={Bot}
                        title={t('settings.aiAgents.sections.linearAgent')}
                        description={t('settings.aiAgents.agent.enabledDesc')}
                        checked={agentEnabled}
                        onCheckedChange={setAgentEnabled}
                    />
                    <SettingsRow
                        title={t('settingsCommon.configure')}
                        control={
                            <Button variant="outline" size="sm" className="h-7 px-3 text-[13px]">
                                {t('settings.aiAgents.agent.configureBtnLabel')}
                            </Button>
                        }
                    />
                </SettingsList>
            </SettingsSection>

            {/* Capabilities */}
            <SettingsSection title={t('settings.aiAgents.sections.capabilities')}>
                <SettingsList>
                    <SettingsRow title={t('settings.aiAgents.capabilities.codingSessions')} control={<StatusPill on={true} />} />
                    <ToggleRow
                        title={t('settings.aiAgents.capabilities.agentAutomations')}
                        description={t('settings.aiAgents.capabilities.agentAutomationsDesc')}
                        checked={agentAutomations}
                        onCheckedChange={setAgentAutomations}
                    />
                    <ToggleRow
                        title={t('settings.aiAgents.capabilities.codeIntelligence')}
                        description={t('settings.aiAgents.capabilities.codeIntelligenceDesc')}
                        checked={codeIntelligence}
                        onCheckedChange={setCodeIntelligence}
                    />
                    <ToggleRow
                        title={t('settings.aiAgents.capabilities.triageIntelligence')}
                        description={t('settings.aiAgents.capabilities.triageIntelligenceDesc')}
                        checked={triageIntelligence}
                        onCheckedChange={setTriageIntelligence}
                    />
                </SettingsList>
            </SettingsSection>

            {/* Agent integrations */}
            <SettingsSection title={t('settings.aiAgents.sections.agentIntegrations')}>
                <p className="text-muted-foreground text-[13px] leading-5">{t('settings.aiAgents.integrations.availabilityNote')}</p>
            </SettingsSection>

            {/* Installed Agents */}
            <SettingsSection title={t('settings.aiAgents.sections.installedAgents')}>
                <EmptyState
                    icon={Boxes}
                    title={t('settings.aiAgents.installedAgents.emptyTitle')}
                    description={t('settings.aiAgents.installedAgents.emptyDesc')}
                    action={
                        <Button variant="outline" size="sm" className="h-7 px-3 text-[13px]">
                            {t('settings.aiAgents.installedAgents.browseBtn')}
                        </Button>
                    }
                />
            </SettingsSection>

            {/* Thread summaries */}
            <SettingsSection title={t('settings.aiAgents.sections.threadSummaries')}>
                <SettingsList>
                    <ToggleRow
                        title={t('settings.aiAgents.threadSummaries.title')}
                        description={t('settings.aiAgents.threadSummaries.desc')}
                        checked={threadSummaries}
                        onCheckedChange={setThreadSummaries}
                    />
                </SettingsList>
            </SettingsSection>
        </LinearSettingsLayout>
    );
}
