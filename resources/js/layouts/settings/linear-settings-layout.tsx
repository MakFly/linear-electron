import { SettingsSidebar } from '@/components/linear/settings-sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles } from 'lucide-react';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Wraps mock/not-yet-implemented settings pages: shows an explanatory banner and
 * renders the page content visually disabled (dimmed, non-interactive) with a
 * "coming soon" tooltip. Pass `comingSoon` on the layout to enable it.
 */
function ComingSoonVeil({ children }: { children: ReactNode }) {
    const { t } = useTranslation();

    return (
        <div>
            <div className="border-border/70 bg-muted/40 text-muted-foreground mb-6 flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px]">
                <Sparkles className="size-4 shrink-0" />
                <span>{t('settings.comingSoon.banner')}</span>
            </div>

            <TooltipProvider delayDuration={150}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative cursor-not-allowed">
                            <div aria-disabled className="pointer-events-none opacity-50 select-none">
                                {children}
                            </div>
                            {/* Transparent layer: blocks interaction and carries the tooltip. */}
                            <div className="absolute inset-0" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">{t('settings.comingSoon.tooltip')}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}

export default function LinearSettingsLayout({ children, comingSoon = false }: { children: ReactNode; comingSoon?: boolean }) {
    return (
        <div className="bg-background text-foreground flex h-screen overflow-hidden">
            <SettingsSidebar />
            <main id="skip-nav" className="min-w-0 flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-[720px] px-5 py-8 sm:px-12 sm:py-14">
                    {comingSoon ? <ComingSoonVeil>{children}</ComingSoonVeil> : children}
                </div>
            </main>
        </div>
    );
}
