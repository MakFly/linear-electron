import { SelectField, SettingsField, SettingsHeader, SettingsList, SettingsSection, ToggleRow } from '@/components/linear/settings/kit';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsPulse() {
    const { t } = useTranslation();
    const [pulseEnabled, setPulseEnabled] = useState(true);
    const [workspaceSchedule, setWorkspaceSchedule] = useState('weekly');
    const [personalSchedule, setPersonalSchedule] = useState('follow');

    const scheduleOptions = [
        { value: 'daily', label: t('settings.pulse.scheduleDaily') },
        { value: 'weekly', label: t('settings.pulse.scheduleWeekly') },
        { value: 'off', label: t('settings.pulse.scheduleOff') },
    ];

    const personalScheduleOptions = [
        { value: 'daily', label: t('settings.pulse.scheduleDaily') },
        { value: 'weekly', label: t('settings.pulse.scheduleWeekly') },
        { value: 'off', label: t('settings.pulse.scheduleOff') },
        { value: 'follow', label: t('settings.pulse.scheduleFollowWorkspace') },
    ];

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.pulse.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.features')}
                title={t('settings.pulse.title')}
                description={t('settings.pulse.description')}
            />

            <SettingsSection>
                <SettingsList>
                    <ToggleRow
                        title={t('settings.pulse.enablePulse')}
                        description={t('settings.pulse.enablePulseDesc')}
                        checked={pulseEnabled}
                        onCheckedChange={setPulseEnabled}
                    />
                </SettingsList>
            </SettingsSection>

            <SettingsSection title={t('settings.pulse.summaryNotifications')} description={t('settings.pulse.summaryNotificationsDesc')}>
                <SettingsField label={t('settings.pulse.workspaceScheduleLabel')} htmlFor="workspace-schedule">
                    <SelectField
                        value={workspaceSchedule}
                        onValueChange={setWorkspaceSchedule}
                        options={scheduleOptions}
                        triggerClassName="max-w-xs"
                    />
                </SettingsField>

                <SettingsField label={t('settings.pulse.personalScheduleLabel')} htmlFor="personal-schedule">
                    <SelectField
                        value={personalSchedule}
                        onValueChange={setPersonalSchedule}
                        options={personalScheduleOptions}
                        triggerClassName="max-w-xs"
                    />
                </SettingsField>
            </SettingsSection>
        </LinearSettingsLayout>
    );
}
