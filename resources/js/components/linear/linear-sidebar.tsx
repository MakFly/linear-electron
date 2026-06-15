import { useShell } from '@/components/linear/shell-context';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useFavorites } from '@/lib/favorites';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Box,
    Check,
    ChevronDown,
    CircleCheck,
    CircleUser,
    CopyCheck,
    Download,
    Ellipsis,
    FileText,
    Github,
    Hash,
    Import,
    Inbox,
    Keyboard,
    Layers2,
    type LucideIcon,
    MessageCircle,
    Minus,
    MousePointer2,
    Plus,
    Search,
    Settings,
    SquarePen,
    Tag,
    UserPlus,
    Users,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type TryDialogKind = 'import' | 'invite' | 'github' | null;

function Shortcut({ children }: { children: ReactNode }) {
    return <span className="text-muted-foreground/60 ml-auto shrink-0 pl-1 text-[11px] tracking-wide tabular-nums">{children}</span>;
}

const helpItems: { label: string; icon: LucideIcon; shortcut?: string; href?: string }[] = [
    { label: 'sidebar.help.searchForHelp', icon: Search },
    { label: 'sidebar.help.docs', icon: FileText },
    { label: 'sidebar.help.contactUs', icon: MessageCircle },
    { label: 'sidebar.help.keyboardShortcuts', icon: Keyboard, shortcut: '⌘ /' },
    { label: 'sidebar.help.linearStatus', icon: CircleCheck },
    { label: 'sidebar.help.downloadApps', icon: Download },
    { label: 'sidebar.help.settings', icon: Settings, shortcut: 'G then S', href: '/settings/account/profile' },
    { label: 'sidebar.help.slackCommunity', icon: Hash },
];

const whatsNewItems = ['Coding sessions in Linear', 'Team documents', 'Full changelog'];

const PROMO_STORAGE_KEY = 'linear-promo-collapsed';

function HelpMenu() {
    const { t } = useTranslation();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    aria-label={t('sidebar.helpAndSupport')}
                    className="text-muted-foreground hover:text-sidebar-foreground border-sidebar-border bg-sidebar hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-foreground flex size-[22px] items-center justify-center rounded-full border text-[12px] leading-none font-medium transition-colors duration-100"
                >
                    ?
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-56 p-1">
                {helpItems.map((item) => {
                    const href = item.href;
                    return (
                        <DropdownMenuItem
                            key={item.label}
                            onSelect={href ? () => router.visit(href) : undefined}
                            className="h-[30px] gap-2 px-2 text-[13px] font-normal"
                        >
                            <item.icon className="text-muted-foreground size-4" />
                            {t(item.label)}
                            {item.shortcut && <Shortcut>{item.shortcut}</Shortcut>}
                        </DropdownMenuItem>
                    );
                })}
                <DropdownMenuSeparator />
                <div className="text-muted-foreground px-2 pt-1 pb-0.5 text-[11px] font-medium">{t('sidebar.whatsNew')}</div>
                {whatsNewItems.map((label) => (
                    <DropdownMenuItem key={label} className="h-[30px] gap-2 px-2 text-[13px] font-normal">
                        <span className="flex size-4 items-center justify-center">
                            <span className="bg-muted-foreground/70 size-[3px] rounded-full" />
                        </span>
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function SectionLabel({ children }: { children: ReactNode }) {
    return (
        <SidebarGroupLabel className="text-muted-foreground hover:text-sidebar-foreground h-7 cursor-pointer gap-1.5 px-2 text-xs font-medium">
            {children}
            <ChevronDown className="text-muted-foreground/70 size-3 transition-transform duration-150 group-data-[state=closed]/section:-rotate-90" />
        </SidebarGroupLabel>
    );
}

function TryDialog({ kind, onClose }: { kind: TryDialogKind; onClose: () => void }) {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');

    const content: Record<Exclude<TryDialogKind, null>, { title: string; body: ReactNode }> = {
        import: {
            title: t('sidebar.dialog.importTitle'),
            body: (
                <div className="flex flex-col gap-2">
                    <p className="text-muted-foreground text-[13px]">{t('sidebar.dialog.importBody')}</p>
                    {['GitHub Issues', 'Jira', 'Asana', 'Shortcut', 'CSV'].map((source) => (
                        <button
                            key={source}
                            onClick={onClose}
                            className="border-border text-foreground hover:bg-accent flex h-9 items-center rounded-md border px-3 text-[13px] font-medium transition-colors duration-100"
                        >
                            {source}
                        </button>
                    ))}
                </div>
            ),
        },
        invite: {
            title: t('sidebar.dialog.inviteTitle'),
            body: (
                <form
                    className="flex flex-col gap-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onClose();
                    }}
                >
                    <p className="text-muted-foreground text-[13px]">{t('sidebar.dialog.inviteBody')}</p>
                    <input
                        autoFocus
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="border-input text-foreground placeholder:text-muted-foreground/60 focus:ring-ring h-9 rounded-md border bg-transparent px-3 text-[13px] focus:ring-1 focus:outline-none"
                    />
                    <div className="flex justify-end">
                        <Button type="submit" size="sm" disabled={!email.includes('@')} className="h-7 px-3 text-xs">
                            {t('sidebar.dialog.sendInvite')}
                        </Button>
                    </div>
                </form>
            ),
        },
        github: {
            title: t('sidebar.dialog.githubTitle'),
            body: (
                <div className="flex flex-col gap-3">
                    <p className="text-muted-foreground text-[13px]">{t('sidebar.dialog.githubBody')}</p>
                    <div className="flex justify-end">
                        <Button size="sm" onClick={onClose} className="h-7 gap-1.5 px-3 text-xs">
                            <Github className="size-3.5" />
                            {t('sidebar.dialog.connectGithubAccount')}
                        </Button>
                    </div>
                </div>
            ),
        },
    };

    return (
        <Dialog open={kind !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="border-border bg-popover max-w-md">
                {kind && (
                    <>
                        <DialogTitle className="text-foreground text-sm font-medium">{content[kind].title}</DialogTitle>
                        {content[kind].body}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

export function LinearSidebar() {
    const { t } = useTranslation();
    const { openNewIssue, openPalette } = useShell();
    const { url } = usePage();
    const [tryDialog, setTryDialog] = useState<TryDialogKind>(null);
    const favorites = useFavorites();

    // Promo card can be minimized to just the help button, persisted across reloads.
    const [promoCollapsed, setPromoCollapsed] = useState(false);
    useEffect(() => setPromoCollapsed(localStorage.getItem(PROMO_STORAGE_KEY) === '1'), []);
    const collapsePromo = () => {
        localStorage.setItem(PROMO_STORAGE_KEY, '1');
        setPromoCollapsed(true);
    };

    const isActive = (href: string) => url === href || (href === '/team/DEV/active' && /^\/team\/DEV\/(all|active|backlog)/.test(url));

    const workspaceItems = [
        { label: t('sidebar.projects'), icon: Box, href: '/projects' },
        { label: t('sidebar.views'), icon: Layers2, href: '/views' },
    ];

    const teamItems = [
        { label: t('sidebar.issues'), icon: CopyCheck, href: '/team/DEV/active' },
        { label: t('sidebar.projects'), icon: Box, href: '/team/DEV/projects' },
        { label: t('sidebar.views'), icon: Layers2, href: '/team/DEV/views' },
    ];

    const tryItems = [
        { label: t('sidebar.tryItems.import'), icon: Import, kind: 'import' as const },
        { label: t('sidebar.tryItems.invite'), icon: UserPlus, kind: 'invite' as const },
        { label: t('sidebar.tryItems.github'), icon: Github, kind: 'github' as const },
    ];

    return (
        <Sidebar variant="inset" collapsible="offcanvas" className="border-0">
            {/* Draggable strip under macOS traffic lights */}
            <div className="app-drag h-6 w-full shrink-0" />
            <SidebarHeader className="px-3 py-0">
                <div className="flex items-center justify-between">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="app-no-drag text-sidebar-foreground hover:bg-sidebar-accent flex h-7 items-center gap-2 rounded-md px-1.5 text-[13px] font-medium transition-colors duration-100">
                                <span className="flex size-[18px] shrink-0 items-center justify-center rounded-[5px] bg-gradient-to-br from-pink-500 to-rose-600 text-[8px] font-bold text-white">
                                    DE
                                </span>
                                devaubree
                                <ChevronDown className="text-muted-foreground size-3" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" sideOffset={6} className="w-52 p-1">
                            <DropdownMenuItem
                                onSelect={() => router.visit('/settings/account/profile')}
                                className="h-[30px] px-2 text-[13px] font-normal"
                            >
                                {t('sidebar.settings')}
                                <Shortcut>G then S</Shortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setTryDialog('invite')} className="h-[30px] px-2 text-[13px] font-normal">
                                {t('sidebar.inviteAndManage')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="h-[30px] px-2 text-[13px] font-normal">{t('sidebar.downloadDesktop')}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="[&>svg]:text-muted-foreground h-[30px] gap-1 px-2 text-[13px] font-normal whitespace-nowrap [&>svg]:size-3.5">
                                    {t('sidebar.switchWorkspace')}
                                    <Shortcut>O then W</Shortcut>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-56 p-1">
                                    <DropdownMenuItem className="h-[30px] gap-2 px-2 text-[13px] font-normal">
                                        <span className="flex size-[18px] shrink-0 items-center justify-center rounded-[5px] bg-gradient-to-br from-pink-500 to-rose-600 text-[8px] font-bold text-white">
                                            DE
                                        </span>
                                        devaubree
                                        <Check className="text-muted-foreground ml-auto size-3.5" />
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="h-[30px] gap-2 px-2 text-[13px] font-normal">
                                        <Plus className="text-muted-foreground size-4" />
                                        {t('sidebar.createOrJoin')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="h-[30px] gap-2 px-2 text-[13px] font-normal">
                                        <UserPlus className="text-muted-foreground size-4" />
                                        {t('sidebar.addAccount')}
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => router.post('/logout')} className="h-[30px] px-2 text-[13px] font-normal">
                                {t('sidebar.logout')}
                                <Shortcut>⌥⇧Q</Shortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="app-no-drag flex items-center gap-1">
                        <button
                            aria-label={t('sidebar.search')}
                            onClick={openPalette}
                            className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground flex size-7 items-center justify-center rounded-md transition-colors duration-100"
                        >
                            <Search className="size-[15px]" />
                        </button>
                        <button
                            aria-label={t('sidebar.newIssue')}
                            onClick={() => openNewIssue()}
                            className="bg-sidebar-accent text-sidebar-foreground hover:text-foreground flex size-7 items-center justify-center rounded-md shadow-sm transition-colors duration-100"
                        >
                            <SquarePen className="size-[15px]" />
                        </button>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="gap-0 px-2 pt-2">
                <SidebarGroup className="p-0 py-1">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0">
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive('/inbox')} className="h-[30px] gap-2.5 px-2 text-[13px] font-medium">
                                    <Link href="/inbox">
                                        <Inbox className="text-muted-foreground size-4" />
                                        {t('sidebar.inbox')}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive('/my-issues')}
                                    className="h-[30px] gap-2.5 px-2 text-[13px] font-medium"
                                >
                                    <Link href="/my-issues">
                                        <CircleUser className="text-muted-foreground size-4" />
                                        {t('sidebar.myIssues')}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {favorites.length > 0 && (
                    <Collapsible defaultOpen className="group/section">
                        <SidebarGroup className="p-0 py-1.5">
                            <CollapsibleTrigger asChild>
                                <SectionLabel>{t('sidebar.favorites')}</SectionLabel>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu className="gap-0">
                                        {favorites.map((favorite) => (
                                            <SidebarMenuItem key={favorite.href}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={url === favorite.href}
                                                    className="h-[30px] gap-2.5 px-2 text-[13px] font-medium"
                                                >
                                                    <Link href={favorite.href}>
                                                        <CopyCheck className="text-muted-foreground size-4" />
                                                        {favorite.label}
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                )}

                <Collapsible defaultOpen className="group/section">
                    <SidebarGroup className="p-0 py-1.5">
                        <CollapsibleTrigger asChild>
                            <SectionLabel>{t('sidebar.workspace')}</SectionLabel>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <SidebarMenu className="gap-0">
                                    {workspaceItems.map((item) => (
                                        <SidebarMenuItem key={item.label}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={url === item.href}
                                                className="h-[30px] gap-2.5 px-2 text-[13px] font-medium"
                                            >
                                                <Link href={item.href}>
                                                    <item.icon className="text-muted-foreground size-4" />
                                                    {item.label}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                    <SidebarMenuItem>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <SidebarMenuButton className="h-[30px] gap-2.5 px-2 text-[13px] font-medium">
                                                    <Ellipsis className="text-muted-foreground size-4" />
                                                    {t('sidebar.more')}
                                                </SidebarMenuButton>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-48">
                                                <DropdownMenuItem onSelect={() => setTryDialog('invite')}>
                                                    <Users className="size-4" />
                                                    {t('sidebar.members')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Tag className="size-4" />
                                                    {t('sidebar.labels')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Settings className="size-4" />
                                                    {t('sidebar.workspaceSettings')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>

                <Collapsible defaultOpen className="group/section">
                    <SidebarGroup className="p-0 py-1.5">
                        <CollapsibleTrigger asChild>
                            <SectionLabel>{t('sidebar.yourTeams')}</SectionLabel>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <SidebarMenu className="gap-0">
                                    <Collapsible defaultOpen className="group/team">
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton className="h-[30px] gap-2 px-2 text-[13px] font-medium">
                                                    <span className="flex size-[18px] shrink-0 items-center justify-center rounded-[5px] bg-gradient-to-br from-green-500 to-emerald-600 text-[10px] font-semibold text-white">
                                                        D
                                                    </span>
                                                    Devaubree
                                                    <ChevronDown className="text-muted-foreground size-3 transition-transform duration-150 group-data-[state=closed]/team:-rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub className="mx-0 ml-2 gap-0 border-0 px-0">
                                                    {teamItems.map((item) => (
                                                        <SidebarMenuSubItem key={item.label}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={isActive(item.href)}
                                                                className="text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground h-[30px] gap-2.5 px-2 text-[13px] font-medium"
                                                            >
                                                                <Link href={item.href}>
                                                                    <item.icon className="text-muted-foreground size-4" />
                                                                    {item.label}
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>

                <Collapsible defaultOpen className="group/section">
                    <SidebarGroup className="p-0 py-1.5">
                        <CollapsibleTrigger asChild>
                            <SectionLabel>{t('sidebar.try')}</SectionLabel>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <SidebarMenu className="gap-0">
                                    {tryItems.map((item) => (
                                        <SidebarMenuItem key={item.label}>
                                            <SidebarMenuButton
                                                onClick={() => setTryDialog(item.kind)}
                                                className="h-[30px] gap-2.5 px-2 text-[13px] font-medium"
                                            >
                                                <item.icon className="text-muted-foreground size-4" />
                                                {item.label}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
            </SidebarContent>

            <SidebarFooter className="p-2">
                {promoCollapsed ? (
                    // Minimized state: only the help button remains, as on linear.app
                    <HelpMenu />
                ) : (
                    // Promo card, as on linear.app — hovering reveals the minimize button
                    <div className="group/footer border-sidebar-border relative overflow-hidden rounded-lg border bg-[hsl(220,5%,5%)]">
                        <button
                            type="button"
                            aria-label={t('sidebar.minimize')}
                            onClick={collapsePromo}
                            className="text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent absolute top-1.5 right-1.5 z-10 flex size-6 items-center justify-center rounded-md opacity-0 transition-opacity duration-100 group-hover/footer:opacity-100"
                        >
                            <Minus className="size-4" />
                        </button>
                        <div
                            className="flex h-[100px] items-center justify-center"
                            style={{
                                background:
                                    'radial-gradient(circle at 50% 50%, hsl(220,6%,12%) 0%, hsl(220,6%,7%) 28%, hsl(220,6,10%) 29%, hsl(220,5%,5%) 60%)',
                            }}
                        >
                            <span className="flex size-11 items-center justify-center rounded-xl bg-white shadow-lg">
                                <MousePointer2 className="size-5 fill-black text-black" />
                            </span>
                        </div>
                        <div className="px-3 pt-1 pb-3">
                            <p className="text-sidebar-foreground text-[13px] font-medium">{t('sidebar.promoTitle')}</p>
                            <p className="text-muted-foreground mt-0.5 text-xs leading-snug">{t('sidebar.promoBody')}</p>
                        </div>
                    </div>
                )}
            </SidebarFooter>

            <TryDialog kind={tryDialog} onClose={() => setTryDialog(null)} />
        </Sidebar>
    );
}
