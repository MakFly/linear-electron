import { CommandPalette } from '@/components/linear/command-palette';
import { IssueSheet } from '@/components/linear/issue-sheet';
import { LinearSidebar } from '@/components/linear/linear-sidebar';
import { NewIssueDialog } from '@/components/linear/new-issue-dialog';
import { ShellContext } from '@/components/linear/shell-context';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useIsNative } from '@/hooks/use-is-native';
import { Issue, IssueMetadata, IssueStatus } from '@/lib/issues';
import { cn } from '@/lib/utils';
import { History, Play } from 'lucide-react';
import { CSSProperties, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LinearShellProps {
    issues: Issue[];
    metadata?: IssueMetadata;
    children: ReactNode;
}

function AgentToolbar() {
    const { t } = useTranslation();
    return (
        <div className="h-7 shrink-0" style={{ height: 28 }}>
            <div className="-mt-1 h-7 bg-[#050505]">
                <div className="relative h-7">
                    <div className="absolute inset-x-0 bottom-0 h-8 pt-0.5 pr-2 pl-0.5">
                        <div data-contextual-menu="true">
                            <div className="relative h-[30px]">
                                <div
                                    data-agent-toolbar-bounds="true"
                                    className="text-muted-foreground flex h-[30px] items-center justify-end gap-0.5 p-[2px_2px_0px]"
                                >
                                    <div className="flex h-7 flex-1 items-center justify-end pl-0">
                                        <div className="relative h-7">
                                            <div data-menu-open="false" className="flex h-7">
                                                <button
                                                    aria-label={t('shell.askLinear')}
                                                    className="hover:bg-accent hover:text-foreground flex h-7 items-center rounded-[8px] border-[0.5px] border-transparent pr-3 pl-2.5 text-[12px] leading-[14.5px] transition-colors duration-100"
                                                >
                                                    <span aria-hidden="true" className="mr-1.5 flex size-3.5 items-center justify-center">
                                                        <Play className="size-3.5" />
                                                    </span>
                                                    <span className="overflow-hidden">
                                                        <span>{t('shell.askLinear')}</span>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div data-menu-open="false" className="flex h-7">
                                            <button
                                                type="button"
                                                aria-label={t('shell.chatHistory')}
                                                className="hover:bg-accent hover:text-foreground relative flex size-7 items-center justify-center rounded-[8px] border-[0.5px] border-transparent px-0.5 transition-colors duration-100"
                                            >
                                                <span aria-hidden="true" className="flex size-4 items-center justify-center">
                                                    <History className="size-4" />
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MainPanel({ children }: { children: ReactNode }) {
    const isNative = useIsNative();
    const { state, isMobile } = useSidebar();
    // In the native window, when the sidebar is collapsed the panel fills the full width
    // and its top edge meets the macOS traffic lights. Drop the top inset (margin/rounding
    // /border) so the header sits flush in the title-bar strip and lines up with them.
    // In a plain browser there are no traffic lights, so we keep the inset card.
    const flushTop = isNative && !isMobile && state === 'collapsed';

    return (
        <div id="mainLayoutContent" className="relative flex min-h-svh flex-1 flex-col overflow-visible bg-[#050505]">
            <SidebarInset
                className={cn(
                    'relative mr-2 mb-2 min-h-0 flex-none overflow-hidden rounded-xl border-[0.5px] border-[#1d1e22] bg-[#0b0b0c] md:peer-data-[variant=inset]:shadow-md',
                    flushTop ? 'mt-0 h-[calc(100svh-36px)] rounded-t-none border-t-0' : 'mt-2 h-[calc(100svh-44px)]',
                )}
            >
                {children}
            </SidebarInset>
            <AgentToolbar />
        </div>
    );
}

const emptyMetadata: IssueMetadata = { labels: [], projects: [], cycles: [] };

export function LinearShell({ issues, metadata = emptyMetadata, children }: LinearShellProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogStatus, setDialogStatus] = useState<IssueStatus>('todo');
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [sheetIssueId, setSheetIssueId] = useState<number | null>(null);

    const openNewIssue = useCallback((status: IssueStatus = 'todo') => {
        setDialogStatus(status);
        setDialogOpen(true);
    }, []);

    const openPalette = useCallback(() => setPaletteOpen(true), []);

    const openIssue = useCallback((issue: Issue) => {
        setSheetIssueId(issue.id);
        setSheetOpen(true);
    }, []);

    const shell = useMemo(() => ({ openNewIssue, openPalette, openIssue }), [openNewIssue, openPalette, openIssue]);

    // Keep the open sheet in sync with the latest server data after a patch.
    const sheetIssue = useMemo(() => issues.find((i) => i.id === sheetIssueId) ?? null, [issues, sheetIssueId]);

    // Global shortcuts, as in Linear: C = new issue, ⌘K = command palette.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setPaletteOpen((v) => !v);
                return;
            }
            if (typing) return;
            if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                openNewIssue('todo');
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [openNewIssue]);

    return (
        <ShellContext.Provider value={shell}>
            <SidebarProvider style={{ '--sidebar-width': '15.25rem' } as CSSProperties}>
                <LinearSidebar />
                <MainPanel>{children}</MainPanel>
                <NewIssueDialog open={dialogOpen} onOpenChange={setDialogOpen} defaultStatus={dialogStatus} metadata={metadata} />
                <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} issues={issues} onNewIssue={() => openNewIssue('todo')} />
                <IssueSheet
                    issue={sheetIssue}
                    issues={issues}
                    metadata={metadata}
                    open={sheetOpen}
                    onOpenChange={setSheetOpen}
                    onNavigate={(issue) => setSheetIssueId(issue.id)}
                />
            </SidebarProvider>
        </ShellContext.Provider>
    );
}
