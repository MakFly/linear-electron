import {
    ConfirmDialog,
    DangerRow,
    DangerZone,
    PlanGate,
    SelectField,
    SettingsField,
    SettingsHeader,
    SettingsList,
    SettingsRow,
    SettingsSection,
    StatusPill,
    ToggleRow,
} from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsTeamDetail() {
    const { t } = useTranslation();

    const [parentTeam, setParentTeam] = useState('none');
    const [resolvedSummaries, setResolvedSummaries] = useState(false);
    const [slackOn] = useState(false);

    const [confirmLeave, setConfirmLeave] = useState(false);
    const [confirmRetire, setConfirmRetire] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const navToast = (section: string) => toast.info({ title: t('settings.teamDetail.navToast', { section }) });

    return (
        <LinearSettingsLayout comingSoon>
            <Head title="Devaubree" />
            <SettingsHeader
                eyebrow={t('settings.navGroups.yourTeams')}
                title={
                    <span className="flex items-center gap-3">
                        <span
                            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[13px] font-bold text-white select-none"
                            style={{ backgroundColor: '#6366f1' }}
                        >
                            D
                        </span>
                        Devaubree
                    </span>
                }
                description={
                    <span className="flex items-center gap-2 text-[13px]">
                        <span className="text-muted-foreground font-mono">{t('settings.teamDetail.identifier')}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{t('settings.teamDetail.visibility')}</span>
                    </span>
                }
            />

            {/* General section */}
            <SettingsSection title={t('settings.teamDetail.general')}>
                <SettingsList>
                    <SettingsRow
                        title={t('settings.teamDetail.general')}
                        description={t('settings.teamDetail.generalDescription')}
                        control={<ChevronRight className="text-muted-foreground size-4" />}
                        onClick={() => navToast(t('settings.teamDetail.general'))}
                    />
                    <SettingsRow
                        title={t('settings.teamDetail.members')}
                        control={
                            <span className="flex items-center gap-2">
                                <span className="text-muted-foreground text-[13px]">{t('settings.teamDetail.membersCount')}</span>
                                <ChevronRight className="text-muted-foreground size-4" />
                            </span>
                        }
                        onClick={() => navToast(t('settings.teamDetail.members'))}
                    />
                    <SettingsRow
                        title={t('settings.teamDetail.slackNotifications')}
                        control={
                            <span className="flex items-center gap-2">
                                <StatusPill on={slackOn} />
                                <ChevronRight className="text-muted-foreground size-4" />
                            </span>
                        }
                        onClick={() => navToast(t('settings.teamDetail.slackNotifications'))}
                    />
                    <SettingsRow
                        title={t('settings.teamDetail.issueLabels')}
                        control={<ChevronRight className="text-muted-foreground size-4" />}
                        onClick={() => navToast(t('settings.teamDetail.issueLabels'))}
                    />
                    <SettingsRow
                        title={t('settings.teamDetail.templates')}
                        description={t('settings.teamDetail.templatesDescription')}
                        control={<ChevronRight className="text-muted-foreground size-4" />}
                        onClick={() => navToast(t('settings.teamDetail.templates'))}
                    />
                    <SettingsRow
                        title={t('settings.teamDetail.recurringIssues')}
                        control={<ChevronRight className="text-muted-foreground size-4" />}
                        onClick={() => navToast(t('settings.teamDetail.recurringIssues'))}
                    />
                </SettingsList>
            </SettingsSection>

            {/* Workflow section */}
            <SettingsSection title={t('settings.teamDetail.workflow')}>
                <SettingsList>
                    <SettingsRow
                        title={t('settings.teamDetail.issueStatuses')}
                        control={<ChevronRight className="text-muted-foreground size-4" />}
                        onClick={() => navToast(t('settings.teamDetail.issueStatuses'))}
                    />
                    <SettingsRow
                        title={t('settings.teamDetail.workflowsAutomations')}
                        control={<ChevronRight className="text-muted-foreground size-4" />}
                        onClick={() => navToast(t('settings.teamDetail.workflowsAutomations'))}
                    />
                    <SettingsRow
                        title={t('settings.teamDetail.triage')}
                        control={<ChevronRight className="text-muted-foreground size-4" />}
                        onClick={() => navToast(t('settings.teamDetail.triage'))}
                    />
                    <SettingsRow
                        title={t('settings.teamDetail.cycles')}
                        control={<ChevronRight className="text-muted-foreground size-4" />}
                        onClick={() => navToast(t('settings.teamDetail.cycles'))}
                    />
                </SettingsList>
            </SettingsSection>

            {/* AI & Agents section */}
            <SettingsSection title={t('settings.teamDetail.aiAgents')}>
                <SettingsList>
                    <SettingsRow
                        title={t('settings.teamDetail.agents')}
                        control={<ChevronRight className="text-muted-foreground size-4" />}
                        onClick={() => navToast(t('settings.teamDetail.agents'))}
                    />
                    <SettingsRow
                        title={t('settings.teamDetail.agentSkills')}
                        control={<ChevronRight className="text-muted-foreground size-4" />}
                        onClick={() => navToast(t('settings.teamDetail.agentSkills'))}
                    />
                    <ToggleRow
                        title={t('settings.teamDetail.resolvedThreadSummaries')}
                        checked={resolvedSummaries}
                        onCheckedChange={setResolvedSummaries}
                    />
                </SettingsList>
            </SettingsSection>

            {/* Team hierarchy — Business plan gate */}
            <SettingsSection title={t('settings.teamDetail.teamHierarchy')}>
                <PlanGate
                    plan="business"
                    description={t('settings.teamDetail.parentTeamDescription')}
                    title={t('settings.teamDetail.parentTeamLabel')}
                    onAction={() => toast.info({ title: t('settingsCommon.startTrial') })}
                />
                <div className="mt-3 max-w-xs">
                    <SettingsField label={t('settings.teamDetail.parentTeamLabel')}>
                        <SelectField
                            value={parentTeam}
                            onValueChange={setParentTeam}
                            options={[
                                { value: 'none', label: t('settings.teamDetail.parentTeamNone') },
                                { value: 'devaubree', label: 'Devaubree' },
                            ]}
                        />
                    </SettingsField>
                    <button
                        type="button"
                        className="text-primary flex w-fit items-center gap-1.5 text-[13px] hover:underline"
                        onClick={() => toast.info({ title: t('settings.teamDetail.parentTeamDocsToast') })}
                    >
                        <BookOpen className="size-3.5" />
                        {t('settings.teamDetail.parentTeamDocsLink')}
                    </button>
                </div>
            </SettingsSection>

            {/* Danger zone */}
            <DangerZone>
                <DangerRow
                    title={t('settings.teamDetail.leaveTeam')}
                    description={t('settings.teamDetail.leaveTeamDescription')}
                    action={
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/40 h-7 px-3 text-[13px]"
                            onClick={() => setConfirmLeave(true)}
                        >
                            {t('settings.teamDetail.leaveTeam')}
                        </Button>
                    }
                />
                <DangerRow
                    title={t('settings.teamDetail.retireTeam')}
                    description={t('settings.teamDetail.retireTeamDescription')}
                    action={
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/40 h-7 px-3 text-[13px]"
                            onClick={() => setConfirmRetire(true)}
                        >
                            {t('settings.teamDetail.retireTeam')}
                        </Button>
                    }
                />
                <DangerRow
                    title={t('settings.teamDetail.deleteTeam')}
                    description={t('settings.teamDetail.deleteTeamDescription')}
                    action={
                        <Button variant="destructive" size="sm" className="h-7 px-3 text-[13px]" onClick={() => setConfirmDelete(true)}>
                            {t('settings.teamDetail.deleteTeam')}
                        </Button>
                    }
                />
            </DangerZone>

            <ConfirmDialog
                open={confirmLeave}
                onOpenChange={setConfirmLeave}
                title={t('settings.teamDetail.leaveTeamConfirmTitle')}
                description={t('settings.teamDetail.leaveTeamConfirmDescription')}
                confirmLabel={t('settings.teamDetail.leaveTeamConfirmLabel')}
                onConfirm={() => toast.success({ title: t('settings.teamDetail.leaveTeam') })}
            />
            <ConfirmDialog
                open={confirmRetire}
                onOpenChange={setConfirmRetire}
                title={t('settings.teamDetail.retireTeamConfirmTitle')}
                description={t('settings.teamDetail.retireTeamConfirmDescription')}
                confirmLabel={t('settings.teamDetail.retireTeamConfirmLabel')}
                onConfirm={() => toast.success({ title: t('settings.teamDetail.retireTeam') })}
            />
            <ConfirmDialog
                open={confirmDelete}
                onOpenChange={setConfirmDelete}
                title={t('settings.teamDetail.deleteTeamConfirmTitle')}
                description={t('settings.teamDetail.deleteTeamConfirmDescription')}
                confirmLabel={t('settings.teamDetail.deleteTeamConfirmLabel')}
                onConfirm={() => toast.success({ title: t('settings.teamDetail.deleteTeam') })}
            />
        </LinearSettingsLayout>
    );
}
