import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function SettingsPlaceholder({ title, titleKey }: { title?: string; titleKey?: string }) {
    const { t } = useTranslation();
    const heading = titleKey ? t(titleKey, { defaultValue: title ?? titleKey }) : (title ?? '');

    return (
        <LinearSettingsLayout>
            <Head title={t('settings.placeholder.headTitle', { name: heading })} />

            <div className="pt-20">
                <p className="text-muted-foreground mb-2 text-[13px]">{t('settings.placeholder.eyebrow')}</p>
                <h1 className="text-[22px] font-medium tracking-normal">{heading}</h1>
                <p className="text-muted-foreground mt-3 max-w-md text-[13px] leading-5">{t('settings.placeholder.comingSoon')}</p>
            </div>
        </LinearSettingsLayout>
    );
}
