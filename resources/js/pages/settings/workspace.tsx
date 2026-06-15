import {
    ConfirmDialog,
    DangerRow,
    DangerZone,
    FieldCard,
    FieldRow,
    PlanGate,
    SelectField,
    SettingsHeader,
    SettingsList,
    SettingsRow,
    SettingsSection,
    TextInput,
} from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsWorkspace() {
    const { t } = useTranslation();

    const [workspaceName, setWorkspaceName] = useState('Devaubree');
    const [workspaceSlug, setWorkspaceSlug] = useState('devaubree');
    const [fiscalMonth, setFiscalMonth] = useState('january');
    const [confirmDelete, setConfirmDelete] = useState(false);

    const monthOptions = [
        { value: 'january', label: t('settings.workspace.months.january') },
        { value: 'february', label: t('settings.workspace.months.february') },
        { value: 'march', label: t('settings.workspace.months.march') },
        { value: 'april', label: t('settings.workspace.months.april') },
        { value: 'may', label: t('settings.workspace.months.may') },
        { value: 'june', label: t('settings.workspace.months.june') },
        { value: 'july', label: t('settings.workspace.months.july') },
        { value: 'august', label: t('settings.workspace.months.august') },
        { value: 'september', label: t('settings.workspace.months.september') },
        { value: 'october', label: t('settings.workspace.months.october') },
        { value: 'november', label: t('settings.workspace.months.november') },
        { value: 'december', label: t('settings.workspace.months.december') },
    ];

    const handleUpdate = () => {
        toast.success({ title: t('settings.workspace.toastSaved') });
    };

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.workspace.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.administration')}
                title={t('settings.workspace.title')}
                description={t('settings.workspace.description')}
            />

            {/* General */}
            <SettingsSection title={t('settings.workspace.sectionGeneral')}>
                {/* Logo upload */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="bg-muted text-foreground flex size-12 items-center justify-center rounded-lg text-[20px] font-medium">D</div>
                    <Button variant="outline" size="sm" className="h-7 px-3 text-[13px]">
                        {t('settings.workspace.uploadLogo')}
                    </Button>
                </div>

                <FieldCard>
                    <FieldRow label={t('settings.workspace.workspaceName')} htmlFor="workspace-name">
                        <TextInput
                            id="workspace-name"
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            className="w-full sm:w-[240px]"
                        />
                    </FieldRow>

                    <FieldRow label={t('settings.workspace.workspaceUrl')} htmlFor="workspace-slug">
                        <div className="flex items-center">
                            <span className="border-border bg-muted text-muted-foreground flex h-8 items-center rounded-l-md border border-r-0 px-3 text-[13px] select-none">
                                {t('settings.workspace.urlPrefix')}
                            </span>
                            <TextInput
                                id="workspace-slug"
                                value={workspaceSlug}
                                onChange={(e) => setWorkspaceSlug(e.target.value)}
                                className="w-full rounded-l-none sm:w-[180px]"
                            />
                        </div>
                    </FieldRow>
                </FieldCard>

                <Button size="sm" className="h-8 px-3 text-[13px]" onClick={handleUpdate}>
                    {t('settingsCommon.update')}
                </Button>
            </SettingsSection>

            {/* Time & region */}
            <SettingsSection title={t('settings.workspace.sectionTimeRegion')}>
                <SettingsList>
                    <SettingsRow
                        title={t('settings.workspace.fiscalMonth')}
                        control={<SelectField value={fiscalMonth} onValueChange={setFiscalMonth} options={monthOptions} triggerClassName="w-36" />}
                    />
                    <SettingsRow
                        title={t('settings.workspace.region')}
                        control={<span className="text-muted-foreground text-[13px]">{t('settings.workspace.regionValue')}</span>}
                    />
                </SettingsList>
            </SettingsSection>

            {/* Welcome message */}
            <SettingsSection title={t('settings.workspace.sectionWelcome')}>
                <PlanGate
                    plan="enterprise"
                    title={t('settings.workspace.welcomeTitle')}
                    description={t('settings.workspace.welcomeDesc')}
                    cta={t('settingsCommon.upgrade')}
                />
            </SettingsSection>

            {/* Danger zone */}
            <SettingsSection>
                <DangerZone title={t('settingsCommon.dangerZone')}>
                    <DangerRow
                        title={t('settings.workspace.deleteWorkspace')}
                        description={t('settings.workspace.deleteWorkspaceDesc')}
                        action={
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive/40 h-7 px-3 text-[13px]"
                                onClick={() => setConfirmDelete(true)}
                            >
                                {t('settings.workspace.deleteWorkspace')}
                            </Button>
                        }
                    />
                </DangerZone>
            </SettingsSection>

            <ConfirmDialog
                open={confirmDelete}
                onOpenChange={setConfirmDelete}
                title={t('settings.workspace.deleteConfirmTitle')}
                description={t('settings.workspace.deleteConfirmDesc')}
                confirmLabel={t('settingsCommon.delete')}
                onConfirm={() => {
                    setConfirmDelete(false);
                    toast.success({ title: t('settings.workspace.toastSaved') });
                }}
            />
        </LinearSettingsLayout>
    );
}
