import {
    EmptyState,
    PlanBadge,
    SettingsField,
    SettingsHeader,
    SettingsSection,
    settingsSurface,
} from '@/components/linear/settings/kit';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { Wand2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsAgentPersonalization() {
    const { t } = useTranslation();

    const [guidance, setGuidance] = useState('');
    const [skillDialogOpen, setSkillDialogOpen] = useState(false);
    const [skillName, setSkillName] = useState('');
    const [skillDescription, setSkillDescription] = useState('');

    function saveGuidance() {
        toast.success({ title: t('settings.agentPersonalizationPage.guidance.saved') });
    }

    function createSkill() {
        if (!skillName.trim()) return;
        setSkillName('');
        setSkillDescription('');
        setSkillDialogOpen(false);
        toast.success({ title: t('settings.agentPersonalizationPage.skills.created') });
    }

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.agentPersonalizationPage.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.personal')}
                title={t('settings.agentPersonalizationPage.title')}
                description={t('settings.agentPersonalizationPage.description')}
            />

            {/* Guidance */}
            <SettingsSection
                title={t('settings.agentPersonalizationPage.guidance.title')}
                description={t('settings.agentPersonalizationPage.guidance.description')}
            >
                <SettingsField label={t('settings.agentPersonalizationPage.guidance.label')}>
                    <textarea
                        className="border-border focus:ring-ring w-full resize-none rounded-md border bg-transparent px-2.5 py-2 text-[13px] leading-5 focus:ring-1 focus:outline-none"
                        style={{ minHeight: '120px' }}
                        placeholder={t('settings.agentPersonalizationPage.guidance.placeholder')}
                        value={guidance}
                        onChange={(e) => setGuidance(e.target.value)}
                    />
                </SettingsField>
                <Button size="sm" className="h-7 px-3 text-[13px]" onClick={saveGuidance}>
                    {t('settingsCommon.save')}
                </Button>
            </SettingsSection>

            {/* Skills */}
            <SettingsSection
                title={t('settings.agentPersonalizationPage.skills.title')}
                description={t('settings.agentPersonalizationPage.skills.description')}
                actions={
                    <Button
                        size="sm"
                        className="h-7 px-3 text-[13px]"
                        onClick={() => setSkillDialogOpen(true)}
                    >
                        {t('settings.agentPersonalizationPage.skills.createSkill')}
                    </Button>
                }
            >
                <EmptyState
                    icon={Wand2}
                    title={t('settings.agentPersonalizationPage.skills.emptyTitle')}
                    description={t('settings.agentPersonalizationPage.skills.emptyDescription')}
                    action={
                        <Button
                            size="sm"
                            className="h-7 px-3 text-[13px]"
                            onClick={() => setSkillDialogOpen(true)}
                        >
                            {t('settings.agentPersonalizationPage.skills.createSkill')}
                        </Button>
                    }
                />
            </SettingsSection>

            {/* MCP servers */}
            <SettingsSection
                title={t('settings.agentPersonalizationPage.mcpServers.title')}
                description={t('settings.agentPersonalizationPage.mcpServers.description')}
            >
                <div className={cn(settingsSurface, 'p-4')}>
                    <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-[13px] font-medium">
                            {t('settings.agentPersonalizationPage.mcpServers.planTitle')}
                        </h3>
                        <PlanBadge plan="business" />
                    </div>
                    <p className="text-muted-foreground mb-3 max-w-lg text-[13px] leading-5">
                        {t('settings.agentPersonalizationPage.mcpServers.planDescription')}
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="h-7 px-3 text-[13px] opacity-50"
                        onClick={() =>
                            toast.success({
                                title: t('settings.agentPersonalizationPage.mcpServers.toastConfigure'),
                            })
                        }
                    >
                        {t('settingsCommon.configure')}
                    </Button>
                    <span className="text-muted-foreground ml-3 text-[12px]">
                        {t('settings.agentPersonalizationPage.mcpServers.workspaceOnly')}
                    </span>
                </div>
            </SettingsSection>

            {/* Create skill dialog */}
            <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">
                            {t('settings.agentPersonalizationPage.skills.dialogTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-[13px]">
                            {t('settings.agentPersonalizationPage.skills.dialogDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-1">
                        <SettingsField
                            label={t('settings.agentPersonalizationPage.skills.nameLabel')}
                            htmlFor="skill-name"
                        >
                            <input
                                id="skill-name"
                                className="border-border focus:ring-ring h-8 w-full rounded-md border bg-transparent px-2.5 text-[13px] focus:ring-1 focus:outline-none"
                                value={skillName}
                                onChange={(e) => setSkillName(e.target.value)}
                                placeholder={t('settings.agentPersonalizationPage.skills.namePlaceholder')}
                            />
                        </SettingsField>
                        <SettingsField
                            label={t('settings.agentPersonalizationPage.skills.descriptionLabel')}
                            htmlFor="skill-description"
                        >
                            <input
                                id="skill-description"
                                className="border-border focus:ring-ring h-8 w-full rounded-md border bg-transparent px-2.5 text-[13px] focus:ring-1 focus:outline-none"
                                value={skillDescription}
                                onChange={(e) => setSkillDescription(e.target.value)}
                                placeholder={t('settings.agentPersonalizationPage.skills.descriptionPlaceholder')}
                            />
                        </SettingsField>
                    </div>
                    <DialogFooter className="mt-2 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSkillDialogOpen(false);
                                setSkillName('');
                                setSkillDescription('');
                            }}
                        >
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={createSkill} disabled={!skillName.trim()}>
                            {t('settingsCommon.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LinearSettingsLayout>
    );
}
