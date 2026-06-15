import { SelectField, SettingsField, SettingsHeader, SettingsList, SettingsRow, SettingsSection } from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { Bell, Edit2, Slack } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type UpdateSchedule = 'none' | 'weekly' | 'biweekly' | 'monthly';

export default function ProjectUpdates() {
    const { t } = useTranslation();
    const [schedule, setSchedule] = useState<UpdateSchedule>('none');
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [pendingSchedule, setPendingSchedule] = useState<UpdateSchedule>('none');

    const scheduleOptions: { value: UpdateSchedule; label: string }[] = [
        { value: 'none', label: t('settings.projectUpdates.scheduleNone') },
        { value: 'weekly', label: t('settings.projectUpdates.scheduleWeekly') },
        { value: 'biweekly', label: t('settings.projectUpdates.scheduleBiweekly') },
        { value: 'monthly', label: t('settings.projectUpdates.scheduleMonthly') },
    ];

    const scheduleLabel = scheduleOptions.find((o) => o.value === schedule)?.label ?? '';

    const openScheduleDialog = () => {
        setPendingSchedule(schedule);
        setScheduleDialogOpen(true);
    };

    const handleSaveSchedule = () => {
        setSchedule(pendingSchedule);
        setScheduleDialogOpen(false);
    };

    const handleConnectSlack = () => {
        toast.success({ title: t('settings.projectUpdates.slackToast') });
    };

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.projectUpdates.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.projects')}
                title={t('settings.projectUpdates.title')}
                description={
                    <>
                        {t('settings.projectUpdates.description')}{' '}
                        <a href="#" className="text-primary text-[13px] underline-offset-2 hover:underline">
                            {t('settingsCommon.docs')}
                        </a>
                    </>
                }
            />

            {/* Update schedule */}
            <SettingsSection title={t('settings.projectUpdates.scheduleTitle')} description={t('settings.projectUpdates.scheduleDesc')}>
                <SettingsList>
                    <SettingsRow
                        icon={Bell}
                        title={t('settings.projectUpdates.currentSchedule')}
                        description={scheduleLabel}
                        control={
                            <Button variant="outline" size="sm" className="h-7 px-3 text-[13px]" onClick={openScheduleDialog}>
                                <Edit2 className="mr-1 size-3" />
                                {t('settingsCommon.edit')}
                            </Button>
                        }
                    />
                </SettingsList>
            </SettingsSection>

            {/* Slack notifications */}
            <SettingsSection title={t('settings.projectUpdates.slackTitle')} description={t('settings.projectUpdates.slackDesc')}>
                <Button variant="outline" size="sm" className="h-7 px-3 text-[13px]" onClick={handleConnectSlack}>
                    <Slack className="mr-1.5 size-3.5" />
                    {t('settings.projectUpdates.slackConnect')}
                </Button>
            </SettingsSection>

            {/* Schedule dialog */}
            <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">{t('settings.projectUpdates.scheduleDialogTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <SettingsField label={t('settings.projectUpdates.scheduleLabel')} htmlFor="update-schedule">
                            <SelectField
                                value={pendingSchedule}
                                onValueChange={(v) => setPendingSchedule(v as UpdateSchedule)}
                                options={scheduleOptions}
                            />
                        </SettingsField>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setScheduleDialogOpen(false)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleSaveSchedule}>
                            {t('settingsCommon.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LinearSettingsLayout>
    );
}
