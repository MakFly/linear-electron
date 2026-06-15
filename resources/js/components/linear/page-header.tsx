import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
    return (
        <header className="app-drag flex h-11 shrink-0 items-center justify-between px-5">
            <div className="app-no-drag flex items-center gap-2 text-[13px]">{left}</div>
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
