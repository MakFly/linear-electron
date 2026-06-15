import { EmptyState, SettingsHeader, SettingsSection } from '@/components/linear/settings/kit';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { AppWindow, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SettingsApplications() {
    const { t } = useTranslation();

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.applications.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.administration')}
                title={t('settings.applications.title')}
                description={t('settings.applications.description')}
            />

            <SettingsSection>
                <div className="mb-4">
                    <button
                        type="button"
                        className="text-primary flex w-fit items-center gap-1.5 text-[13px] hover:underline"
                        onClick={() => toast.info({ title: t('settings.applications.docsToast') })}
                    >
                        <BookOpen className="size-3.5" />
                        {t('settings.applications.docsLink')}
                    </button>
                </div>
                <EmptyState
                    icon={AppWindow}
                    title={t('settings.applications.emptyTitle')}
                    description={t('settings.applications.emptyDescription')}
                />
            </SettingsSection>
        </LinearSettingsLayout>
    );
}
