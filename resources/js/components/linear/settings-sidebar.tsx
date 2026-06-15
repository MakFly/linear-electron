import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    AppWindow,
    Bell,
    Bot,
    Boxes,
    Braces,
    Building2,
    ClipboardList,
    CreditCard,
    FileInput,
    FileText,
    FolderKanban,
    Gauge,
    GitPullRequest,
    Inbox,
    Landmark,
    Laptop,
    Link2,
    Lock,
    Megaphone,
    MessageSquareText,
    Plug,
    Radio,
    Rocket,
    Shield,
    SlidersHorizontal,
    Smile,
    Sparkles,
    Tags,
    UserRound,
    UsersRound,
    type LucideIcon,
} from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type SettingsItem = {
    title: string;
    href: string;
    icon: LucideIcon;
};

type SettingsGroup = {
    title: string;
    items: SettingsItem[];
};

const groups: SettingsGroup[] = [
    {
        title: 'settings.navGroups.personal',
        items: [
            { title: 'settings.nav.preferences', href: '/settings/account/preferences', icon: SlidersHorizontal },
            { title: 'settings.nav.profile', href: '/settings/account/profile', icon: UserRound },
            { title: 'settings.nav.notifications', href: '/settings/account/notifications', icon: Bell },
            { title: 'settings.nav.codeReviews', href: '/settings/account/code-and-reviews', icon: GitPullRequest },
            { title: 'settings.nav.securityAccess', href: '/settings/account/security-and-access', icon: Lock },
            { title: 'settings.nav.connectedAccounts', href: '/settings/account/connected-accounts', icon: Link2 },
            { title: 'settings.nav.agentPersonalization', href: '/settings/account/agent-personalization', icon: Bot },
        ],
    },
    {
        title: 'settings.navGroups.issues',
        items: [
            { title: 'settings.nav.labels', href: '/settings/issues/labels', icon: Tags },
            { title: 'settings.nav.templates', href: '/settings/issues/templates', icon: ClipboardList },
            { title: 'settings.nav.slas', href: '/settings/issues/sla', icon: Gauge },
        ],
    },
    {
        title: 'settings.navGroups.projects',
        items: [
            { title: 'settings.nav.labels', href: '/settings/projects/labels', icon: Tags },
            { title: 'settings.nav.templates', href: '/settings/projects/templates', icon: FileText },
            { title: 'settings.nav.statuses', href: '/settings/projects/statuses', icon: Boxes },
            { title: 'settings.nav.updates', href: '/settings/projects/updates', icon: Megaphone },
        ],
    },
    {
        title: 'settings.navGroups.features',
        items: [
            { title: 'settings.nav.aiAgents', href: '/settings/features/ai', icon: Sparkles },
            { title: 'settings.nav.initiatives', href: '/settings/features/initiatives', icon: Landmark },
            { title: 'settings.nav.documents', href: '/settings/features/documents', icon: FileText },
            { title: 'settings.nav.customerRequests', href: '/settings/features/customer-requests', icon: Inbox },
            { title: 'settings.nav.releases', href: '/settings/features/releases', icon: Rocket },
            { title: 'settings.nav.pulse', href: '/settings/features/pulse', icon: Radio },
            { title: 'settings.nav.asks', href: '/settings/features/asks', icon: MessageSquareText },
            { title: 'settings.nav.emojis', href: '/settings/features/emojis', icon: Smile },
            { title: 'settings.nav.integrations', href: '/settings/features/integrations', icon: Plug },
        ],
    },
    {
        title: 'settings.navGroups.administration',
        items: [
            { title: 'settings.nav.workspace', href: '/settings/administration/workspace', icon: Building2 },
            { title: 'settings.nav.teams', href: '/settings/administration/teams', icon: UsersRound },
            { title: 'settings.nav.members', href: '/settings/administration/members', icon: UserRound },
            { title: 'settings.nav.security', href: '/settings/administration/security', icon: Shield },
            { title: 'settings.nav.api', href: '/settings/administration/api', icon: Braces },
            { title: 'settings.nav.applications', href: '/settings/administration/applications', icon: AppWindow },
            { title: 'settings.nav.billing', href: '/settings/administration/billing', icon: CreditCard },
            { title: 'settings.nav.importExport', href: '/settings/administration/import-export', icon: FileInput },
        ],
    },
    {
        title: 'settings.navGroups.yourTeams',
        items: [
            { title: 'Devaubree', href: '/settings/teams/DEV', icon: FolderKanban },
            { title: 'settings.nav.createTeam', href: '/settings/teams/new', icon: Laptop },
        ],
    },
];

// Pages actually wired to a backend. Every other settings page is a mock/preview
// and is flagged with a "coming soon" badge here (and disabled on the page itself).
const IMPLEMENTED = new Set(['/settings/account/preferences', '/settings/account/profile', '/settings/issues/labels']);

// Settings pages render LinearSettingsLayout inside their own render (no persistent
// Inertia layout), so this sidebar is remounted on every navigation. Persist its
// scroll position across remounts to avoid it jumping back to the top on each visit.
let savedScrollTop = 0;

export function SettingsSidebar() {
    const { t } = useTranslation();
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    const navRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        const nav = navRef.current;
        if (!nav) return;

        nav.scrollTop = savedScrollTop;
        const handleScroll = () => {
            savedScrollTop = nav.scrollTop;
        };
        nav.addEventListener('scroll', handleScroll, { passive: true });
        return () => nav.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            ref={navRef}
            className="border-border/70 bg-sidebar text-sidebar-foreground hidden h-full w-[219px] shrink-0 overflow-y-auto border-r px-3 pt-11 pb-3 md:block"
        >
            <Link
                href="/"
                className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-3 flex h-7 items-center gap-2 rounded-md px-2 text-[13px] transition"
            >
                <span className="text-[16px] leading-none">‹</span>
                <span>{t('settings.backToApp')}</span>
            </Link>

            <div className="space-y-4">
                {groups.map((group) => (
                    <section key={group.title}>
                        <h2 className="text-muted-foreground/70 mb-1 px-2 text-[11px] font-medium">{t(group.title)}</h2>

                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = currentPath === item.href;
                                const comingSoon = !IMPLEMENTED.has(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex h-[30px] items-center gap-2 rounded-md px-2 text-[13px] transition',
                                            active
                                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
                                        )}
                                    >
                                        <Icon className="text-muted-foreground size-4" />
                                        <span className="truncate">{t(item.title)}</span>
                                        {comingSoon ? (
                                            <Badge variant="secondary" className="ml-auto h-[17px] shrink-0 px-1.5 text-[10px] font-medium">
                                                {t('settings.comingSoon.badge')}
                                            </Badge>
                                        ) : null}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </nav>
    );
}
