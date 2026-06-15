import {
    SelectField,
    SettingsHeader,
    SettingsList,
    SettingsRow,
    SettingsSection,
    ToggleRow,
} from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsInitiatives() {
    const { t } = useTranslation();

    const [initiativesEnabled, setInitiativesEnabled] = useState(true);
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [schedule, setSchedule] = useState('weekly');
    const [pendingSchedule, setPendingSchedule] = useState(schedule);

    const scheduleOptions = [
        { value: 'none', label: t('settings.initiatives.updateSchedule.noExpectation') },
        { value: 'weekly', label: t('settings.initiatives.updateSchedule.weekly') },
        { value: 'monthly', label: t('settings.initiatives.updateSchedule.monthly') },
    ];

    const scheduleLabel = scheduleOptions.find((o) => o.value === schedule)?.label ?? schedule;

    function openScheduleDialog() {
        setPendingSchedule(schedule);
        setScheduleDialogOpen(true);
    }

    function saveSchedule() {
        setSchedule(pendingSchedule);
        setScheduleDialogOpen(false);
    }

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.initiatives.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.features')}
                title={t('settings.initiatives.title')}
                description={t('settings.initiatives.description')}
            />

            <SettingsSection>
                <SettingsList>
                    <ToggleRow
                        title={t('settings.initiatives.enable.title')}
                        description={t('settings.initiatives.enable.desc')}
                        checked={initiativesEnabled}
                        onCheckedChange={setInitiativesEnabled}
                    />
                </SettingsList>
            </SettingsSection>

            <SettingsSection title={t('settings.initiatives.sections.updates')}>
                <SettingsList>
                    <SettingsRow
                        title={t('settings.initiatives.updateSchedule.label')}
                        description={scheduleLabel}
                        control={
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-[13px]"
                                onClick={openScheduleDialog}
                            >
                                {t('settingsCommon.edit')}
                            </Button>
                        }
                    />
                </SettingsList>
            </SettingsSection>

            <SettingsSection
                title={t('settings.initiatives.sections.slack')}
                description={t('settings.initiatives.slack.desc')}
            >
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-[13px]"
                    onClick={() => toast.success({ title: t('settings.initiatives.slack.toastSuccess') })}
                >
                    {t('settings.initiatives.slack.connectBtn')}
                </Button>
            </SettingsSection>

            <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">
                            {t('settings.initiatives.updateSchedule.dialogTitle')}
                        </DialogTitle>
                    </DialogHeader>
                    <SelectField
                        value={pendingSchedule}
                        onValueChange={setPendingSchedule}
                        options={scheduleOptions}
                    />
                    <DialogFooter className="mt-2 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 text-[13px]"
                            onClick={() => setScheduleDialogOpen(false)}
                        >
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" className="h-7 px-3 text-[13px]" onClick={saveSchedule}>
                            {t('settingsCommon.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LinearSettingsLayout>
    );
}
