import { SettingsHeader, SettingsList, SettingsRow, SettingsSection, StatusPill, Switch, ToggleRow } from '@/components/linear/settings/kit';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { BellRing, Mail, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsNotifications() {
    const { t } = useTranslation();

    const [channels, setChannels] = useState({
        desktop: true,
        mobile: false,
        email: true,
        slack: false,
    });

    const [productUpdates, setProductUpdates] = useState({
        changelog: true,
        newsletter: false,
        marketing: false,
        invite: true,
        privacy: true,
        dpa: false,
    });

    function toggleChannel(key: keyof typeof channels) {
        setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    function toggleProduct(key: keyof typeof productUpdates) {
        setProductUpdates((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.notificationsPage.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.personal')}
                title={t('settings.notificationsPage.title')}
                description={t('settings.notificationsPage.description')}
            />

            <SettingsSection title={t('settings.notificationsPage.channels.title')}>
                <SettingsList>
                    <SettingsRow
                        icon={Monitor}
                        title={t('settings.notificationsPage.channels.desktop.title')}
                        description={t('settings.notificationsPage.channels.desktop.description')}
                        control={
                            <>
                                <StatusPill on={channels.desktop} />
                                <Switch checked={channels.desktop} onCheckedChange={() => toggleChannel('desktop')} />
                            </>
                        }
                    />
                    <SettingsRow
                        icon={Smartphone}
                        title={t('settings.notificationsPage.channels.mobile.title')}
                        description={t('settings.notificationsPage.channels.mobile.description')}
                        control={
                            <>
                                <StatusPill on={channels.mobile} />
                                <Switch checked={channels.mobile} onCheckedChange={() => toggleChannel('mobile')} />
                            </>
                        }
                    />
                    <SettingsRow
                        icon={Mail}
                        title={t('settings.notificationsPage.channels.email.title')}
                        description={t('settings.notificationsPage.channels.email.description')}
                        control={
                            <>
                                <StatusPill on={channels.email} />
                                <Switch checked={channels.email} onCheckedChange={() => toggleChannel('email')} />
                            </>
                        }
                    />
                    <SettingsRow
                        icon={BellRing}
                        title={t('settings.notificationsPage.channels.slack.title')}
                        description={t('settings.notificationsPage.channels.slack.description')}
                        control={
                            <>
                                <StatusPill on={channels.slack} />
                                <Switch checked={channels.slack} onCheckedChange={() => toggleChannel('slack')} />
                            </>
                        }
                    />
                </SettingsList>
            </SettingsSection>

            <SettingsSection title={t('settings.notificationsPage.productUpdates.title')}>
                <SettingsList>
                    <ToggleRow
                        title={t('settings.notificationsPage.productUpdates.changelog.title')}
                        description={t('settings.notificationsPage.productUpdates.changelog.description')}
                        checked={productUpdates.changelog}
                        onCheckedChange={() => toggleProduct('changelog')}
                    />
                    <ToggleRow
                        title={t('settings.notificationsPage.productUpdates.newsletter.title')}
                        description={t('settings.notificationsPage.productUpdates.newsletter.description')}
                        checked={productUpdates.newsletter}
                        onCheckedChange={() => toggleProduct('newsletter')}
                    />
                    <ToggleRow
                        title={t('settings.notificationsPage.productUpdates.marketing.title')}
                        description={t('settings.notificationsPage.productUpdates.marketing.description')}
                        checked={productUpdates.marketing}
                        onCheckedChange={() => toggleProduct('marketing')}
                    />
                    <ToggleRow
                        title={t('settings.notificationsPage.productUpdates.invite.title')}
                        description={t('settings.notificationsPage.productUpdates.invite.description')}
                        checked={productUpdates.invite}
                        onCheckedChange={() => toggleProduct('invite')}
                    />
                    <ToggleRow
                        title={t('settings.notificationsPage.productUpdates.privacy.title')}
                        description={t('settings.notificationsPage.productUpdates.privacy.description')}
                        checked={productUpdates.privacy}
                        onCheckedChange={() => toggleProduct('privacy')}
                    />
                    <ToggleRow
                        title={t('settings.notificationsPage.productUpdates.dpa.title')}
                        description={t('settings.notificationsPage.productUpdates.dpa.description')}
                        checked={productUpdates.dpa}
                        onCheckedChange={() => toggleProduct('dpa')}
                    />
                </SettingsList>
            </SettingsSection>
        </LinearSettingsLayout>
    );
}
