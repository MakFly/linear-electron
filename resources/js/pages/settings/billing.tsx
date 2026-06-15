import { EmptyState, SettingsHeader, SettingsSection, settingsSurface } from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { Receipt, Sparkles, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PLANS = ['planFree', 'planBasic', 'planBusiness', 'planEnterprise'] as const;
const PLAN_PRICE_KEYS = {
    planFree: 'planFreePrice',
    planBasic: 'planBasicPrice',
    planBusiness: 'planBusinessPrice',
    planEnterprise: 'planEnterprisePrice',
} as const;

export default function SettingsBilling() {
    const { t } = useTranslation();

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.billing.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.administration')}
                title={t('settings.billing.title')}
                description={t('settings.billing.description')}
            />

            {/* Current plan card */}
            <SettingsSection title={t('settings.billing.currentPlan')}>
                <div className={cn(settingsSurface, 'flex items-center justify-between gap-4 p-4')}>
                    <div>
                        <div className="text-[15px] font-medium">{t('settings.billing.planName')}</div>
                        <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-[13px]">
                            <Users className="size-3.5" />
                            {t('settings.billing.seatCount')}
                        </div>
                    </div>
                    <Button size="sm" className="h-7 px-3 text-[13px]">
                        {t('settings.billing.upgradeNow')}
                    </Button>
                </div>
            </SettingsSection>

            {/* Plans comparison */}
            <SettingsSection
                title={t('settings.billing.plans')}
                actions={
                    <Button variant="outline" size="sm" className="h-7 px-3 text-[13px]">
                        {t('settings.billing.viewAllPlans')}
                    </Button>
                }
            >
                <div className="grid grid-cols-4 gap-3">
                    {PLANS.map((planKey) => (
                        <div key={planKey} className={cn(settingsSurface, 'flex flex-col gap-1 p-3')}>
                            <div className="text-[13px] font-medium">{t(`settings.billing.${planKey}`)}</div>
                            <div className="text-muted-foreground text-[12px]">{t(`settings.billing.${PLAN_PRICE_KEYS[planKey]}`)}</div>
                        </div>
                    ))}
                </div>
            </SettingsSection>

            {/* Manage billing */}
            <SettingsSection>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-[13px]"
                    onClick={() => toast.info({ title: t('settings.billing.manageBillingToast') })}
                >
                    {t('settings.billing.manageBilling')}
                </Button>
            </SettingsSection>

            {/* AI usage & credits */}
            <SettingsSection title={t('settings.billing.aiUsage')}>
                <div className={cn(settingsSurface, 'p-4')}>
                    <div className="mb-2 flex items-center gap-2">
                        <Sparkles className="text-muted-foreground size-4" />
                        <span className="text-[13px] font-medium">{t('settings.billing.aiCreditsUsed')}</span>
                    </div>
                    {/* Usage bar */}
                    <div className="bg-muted h-1.5 w-full rounded-full overflow-hidden mb-2">
                        <div className="bg-primary h-full rounded-full" style={{ width: '42%' }} />
                    </div>
                    <p className="text-muted-foreground text-[12px] leading-4">{t('settings.billing.aiCreditsDescription')}</p>
                </div>
            </SettingsSection>

            {/* Recent invoices */}
            <SettingsSection title={t('settings.billing.invoices')}>
                <EmptyState
                    icon={Receipt}
                    title={t('settings.billing.invoicesEmptyTitle')}
                    description={t('settings.billing.invoicesEmptyDescription')}
                />
            </SettingsSection>
        </LinearSettingsLayout>
    );
}
