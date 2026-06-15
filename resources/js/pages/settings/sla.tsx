import { Button } from '@/components/ui/button';
import {
    EmptyState,
    PlanGate,
    SettingsField,
    SettingsHeader,
    SettingsSection,
    TextInput,
    settingsDivider,
    settingsSurface,
} from '@/components/linear/settings/kit';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { Clock, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SlaRule {
    id: number;
    name: string;
}

let nextId = 1;

export default function Sla() {
    const { t } = useTranslation();
    const [rules, setRules] = useState<SlaRule[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newName, setNewName] = useState('');

    const handleCreate = () => {
        if (!newName.trim()) return;
        setRules((prev) => [...prev, { id: nextId++, name: newName.trim() }]);
        setNewName('');
        setDialogOpen(false);
    };

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.sla.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.issues')}
                title={t('settings.sla.title')}
                description={
                    <>
                        {t('settings.sla.description')}{' '}
                        <a href="#" className="text-primary underline-offset-2 hover:underline text-[13px]">
                            {t('settingsCommon.docs')}
                        </a>
                    </>
                }
            />

            <SettingsSection>
                <PlanGate
                    plan="business"
                    icon={Clock}
                    title={t('settings.sla.planGateTitle')}
                    description={t('settings.sla.planGateDesc')}
                    cta={t('settingsCommon.startTrial')}
                    onAction={() => {}}
                />
            </SettingsSection>

            <SettingsSection
                title={t('settings.sla.automationTitle')}
                description={t('settings.sla.automationDesc')}
                actions={
                    <Button size="sm" className="h-7 px-3 text-[13px]" onClick={() => setDialogOpen(true)}>
                        <Plus className="mr-1 size-3.5" />
                        {t('settings.sla.addRule')}
                    </Button>
                }
            >
                {rules.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title={t('settings.sla.emptyRules')}
                        description={t('settings.sla.emptyRulesDesc')}
                    />
                ) : (
                    <ul className={cn(settingsSurface, 'overflow-hidden')}>
                        {rules.map((rule) => (
                            <li
                                key={rule.id}
                                className={cn(settingsDivider, 'flex min-h-[46px] items-center gap-3 border-b px-4 last:border-b-0')}
                            >
                                <Clock className="text-muted-foreground size-4 shrink-0" />
                                <span className="text-[13px] font-medium">{rule.name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </SettingsSection>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">{t('settings.sla.dialogTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <SettingsField label={t('settings.sla.ruleNameLabel')} htmlFor="rule-name">
                            <TextInput
                                id="rule-name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={t('settings.sla.ruleNamePlaceholder')}
                            />
                        </SettingsField>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
                            {t('settingsCommon.add')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LinearSettingsLayout>
    );
}
