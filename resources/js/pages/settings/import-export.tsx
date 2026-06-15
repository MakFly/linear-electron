import { SelectField, SettingsField, SettingsHeader, SettingsList, SettingsRow, SettingsSection } from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { Download, Terminal } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const PROVIDERS = [
    { key: 'asana', name: 'Asana', icon: '🟠' },
    { key: 'shortcut', name: 'Shortcut', icon: '⚡' },
    { key: 'github', name: 'GitHub', icon: '🐙' },
    { key: 'jira', name: 'Jira', icon: '🔷' },
    { key: 'linear', name: 'Linear', icon: '⬡' },
] as const;

export default function SettingsImportExport() {
    const { t } = useTranslation();
    const [includePrivate, setIncludePrivate] = useState('yes');

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.importExport.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.administration')}
                title={t('settings.importExport.title')}
                description={t('settings.importExport.description')}
            />

            {/* Import */}
            <SettingsSection title={t('settings.importExport.importSection')} description={t('settings.importExport.importDescription')}>
                <SettingsList>
                    {PROVIDERS.map((provider) => (
                        <SettingsRow
                            key={provider.key}
                            iconNode={<span className="w-5 shrink-0 text-center text-[18px] leading-none select-none">{provider.icon}</span>}
                            title={provider.name}
                            control={
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-3 text-[13px]"
                                    onClick={() =>
                                        toast.info({
                                            title: t('settings.importExport.importToast', { provider: provider.name }),
                                        })
                                    }
                                >
                                    {t('settings.importExport.importButton')}
                                </Button>
                            }
                        />
                    ))}
                </SettingsList>
            </SettingsSection>

            {/* CLI import */}
            <SettingsSection title={t('settings.importExport.cliImport')} description={t('settings.importExport.cliImportDescription')}>
                <button
                    type="button"
                    className="text-primary flex w-fit items-center gap-1.5 text-[13px] hover:underline"
                    onClick={() => toast.info({ title: t('settings.importExport.cliImportToast') })}
                >
                    <Terminal className="size-3.5" />
                    {t('settings.importExport.cliImportLink')}
                </button>
            </SettingsSection>

            {/* Export */}
            <SettingsSection title={t('settings.importExport.exportSection')} description={t('settings.importExport.exportDescription')}>
                <div className="max-w-xs space-y-4">
                    <SettingsField label={t('settings.importExport.includePrivateTeams')}>
                        <SelectField
                            value={includePrivate}
                            onValueChange={setIncludePrivate}
                            options={[
                                { value: 'yes', label: t('settings.importExport.includePrivateTeamsYes') },
                                { value: 'no', label: t('settings.importExport.includePrivateTeamsNo') },
                            ]}
                        />
                    </SettingsField>
                    <Button
                        size="sm"
                        className="flex h-7 items-center gap-1.5 px-3 text-[13px]"
                        onClick={() => toast.success({ title: t('settings.importExport.exportToast') })}
                    >
                        <Download className="size-3.5" />
                        {t('settings.importExport.exportButton')}
                    </Button>
                </div>
            </SettingsSection>
        </LinearSettingsLayout>
    );
}
