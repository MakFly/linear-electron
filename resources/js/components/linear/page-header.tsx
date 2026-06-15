import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useIsNative } from '@/hooks/use-is-native';
import { cn } from '@/lib/utils';
import { Bell, Inbox } from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export function HeaderIconButton({
    label,
    children,
    onClick,
    active,
}: {
    label: string;
    children: ReactNode;
    onClick?: () => void;
    active?: boolean;
}) {
    return (
        <button
            aria-label={label}
            onClick={onClick}
            data-active={active || undefined}
            className="app-no-drag text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors duration-100 data-[active]:text-yellow-400"
        >
            {children}
        </button>
    );
}

export function NotificationsButton() {
    const { t } = useTranslation();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    aria-label={t('header.notifications')}
                    className="app-no-drag text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors duration-100"
                >
                    <Bell className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-0">
                <div className="border-border text-foreground border-b px-3 py-2 text-[13px] font-medium">{t('header.notifications')}</div>
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                    <Inbox className="text-muted-foreground/60 size-6" />
                    <p className="text-muted-foreground text-[13px]">{t('header.notificationsEmpty')}</p>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function PageHeader({ left, right }: { left: ReactNode; right?: ReactNode }) {
    const { t } = useTranslation();
    const isNative = useIsNative();
    const { state, isMobile } = useSidebar();
    const sidebarHidden = isMobile || state === 'collapsed';
    // The macOS traffic lights only exist in the native window. When the sidebar is
    // hidden there, the header sits in the title-bar strip, so we push the content
    // DOWN below the traffic lights (which keeps the breadcrumb flush-left, since it
    // now clears them vertically rather than horizontally). In a plain browser there
    // are no traffic lights, so the header keeps its normal height.
    const clearTrafficLights = isNative && sidebarHidden;

    return (
        <header className={cn('app-drag mt-4 flex shrink-0 items-center justify-between pr-5 pl-3', clearTrafficLights ? 'min-h-12 pt-9 pb-2' : 'h-11')}>
            <div className="app-no-drag flex items-center gap-2 text-[13px]">
                <SidebarTrigger
                    aria-label={t('header.toggleSidebar')}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground size-7 shrink-0"
                />
                {left}
            </div>
            <div className="app-no-drag flex items-center gap-0.5">
                {right}
                <NotificationsButton />
            </div>
        </header>
    );
}

export function TeamBadge() {
    return (
        <span className="flex size-[18px] items-center justify-center rounded-[5px] bg-gradient-to-br from-green-500 to-emerald-600 text-[10px] font-semibold text-white">
            D
        </span>
    );
}
