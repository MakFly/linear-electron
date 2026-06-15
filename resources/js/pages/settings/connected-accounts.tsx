import { SettingsHeader, SettingsList, SettingsRow, SettingsSection, StatusPill } from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ProviderIconProps {
    label: string;
    color: string;
    textColor?: string;
}

function ProviderIcon({ label, color, textColor = '#fff' }: ProviderIconProps) {
    return (
        <div
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-[13px] font-bold"
            style={{ backgroundColor: color, color: textColor }}
        >
            {label}
        </div>
    );
}

type ProviderId = 'slack' | 'googleCalendar' | 'notion' | 'github';

export default function SettingsConnectedAccounts() {
    const { t } = useTranslation();

    const [connections, setConnections] = useState<Record<ProviderId, boolean>>({
        slack: false,
        googleCalendar: false,
        notion: false,
        github: true,
    });

    function toggleConnection(provider: ProviderId) {
        setConnections((prev) => ({ ...prev, [provider]: !prev[provider] }));
    }

    const providers: Array<{
        id: ProviderId;
        iconLabel: string;
        iconColor: string;
        iconTextColor?: string;
    }> = [
        { id: 'slack', iconLabel: 'S', iconColor: '#4A154B' },
        { id: 'googleCalendar', iconLabel: 'G', iconColor: '#4285F4' },
        { id: 'notion', iconLabel: 'N', iconColor: '#191919' },
        { id: 'github', iconLabel: 'GH', iconColor: '#24292E' },
    ];

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.connectedAccountsPage.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.personal')}
                title={t('settings.connectedAccountsPage.title')}
                description={t('settings.connectedAccountsPage.description')}
            />

            <SettingsSection>
                <SettingsList>
                    {providers.map(({ id, iconLabel, iconColor, iconTextColor }) => {
                        const connected = connections[id];
                        return (
                            <SettingsRow
                                key={id}
                                iconNode={<ProviderIcon label={iconLabel} color={iconColor} textColor={iconTextColor} />}
                                title={t(`settings.connectedAccountsPage.providers.${id}.title`)}
                                description={t(`settings.connectedAccountsPage.providers.${id}.description`)}
                                control={
                                    <>
                                        {connected && <StatusPill on={true} onLabel={t('settingsCommon.connected')} />}
                                        <Button variant="outline" size="sm" className="h-7 px-3 text-[13px]" onClick={() => toggleConnection(id)}>
                                            {connected ? t('settingsCommon.disconnect') : t('settingsCommon.connect')}
                                        </Button>
                                    </>
                                }
                            />
                        );
                    })}
                </SettingsList>
            </SettingsSection>

            <SettingsSection>
                <SettingsList>
                    <SettingsRow
                        iconNode={<ProviderIcon label="GH" color="#24292E" />}
                        title={t('settings.connectedAccountsPage.workspaceConnection.title')}
                        description={t('settings.connectedAccountsPage.workspaceConnection.description')}
                        onClick={() =>
                            toast.success({
                                title: t('settings.connectedAccountsPage.workspaceConnection.toastRedirect'),
                            })
                        }
                    />
                </SettingsList>
            </SettingsSection>
        </LinearSettingsLayout>
    );
}
