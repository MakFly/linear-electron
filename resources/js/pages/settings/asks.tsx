import { PlanGate, SettingsHeader, SettingsSection } from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { BookOpen, MessageCircleQuestion } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SettingsAsks() {
    const { t } = useTranslation();

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.asks.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.features')}
                title={t('settings.asks.title')}
                description={t('settings.asks.description')}
            />

            <SettingsSection>
                <PlanGate
                    plan="business"
                    icon={MessageCircleQuestion}
                    title={t('settings.asks.gateTitle')}
                    description={t('settings.asks.gateDescription')}
                    cta={t('settingsCommon.startTrial')}
                    onAction={() => {}}
                />
            </SettingsSection>

            <SettingsSection>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-[13px]"
                    onClick={() => window.open('https://linear.app/docs/asks', '_blank')}
                >
                    <BookOpen className="mr-1.5 size-3.5" />
                    {t('settingsCommon.docs')}
                </Button>
            </SettingsSection>
        </LinearSettingsLayout>
    );
}
