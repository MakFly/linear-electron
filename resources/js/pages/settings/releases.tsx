import {
    PlanGate,
    SettingsHeader,
    SettingsSection,
} from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { BookOpen, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SettingsReleases() {
    const { t } = useTranslation();

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.releases.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.features')}
                title={t('settings.releases.title')}
                description={t('settings.releases.description')}
            />

            <SettingsSection>
                <PlanGate
                    plan="business"
                    icon={Tag}
                    title={t('settings.releases.gateTitle')}
                    description={t('settings.releases.gateDescription')}
                    cta={t('settingsCommon.viewPlans')}
                    onAction={() => {}}
                />
            </SettingsSection>

            <SettingsSection>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-[13px]"
                    onClick={() => window.open('https://linear.app/docs/releases', '_blank')}
                >
                    <BookOpen className="mr-1.5 size-3.5" />
                    {t('settingsCommon.docs')}
                </Button>
            </SettingsSection>
        </LinearSettingsLayout>
    );
}
