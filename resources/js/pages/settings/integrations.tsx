import { EmptyState, SearchInput, SettingsHeader, SettingsSection, settingsSurface } from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { Puzzle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

type IntegrationKey =
    | 'slack'
    | 'linearAsksForSlack'
    | 'github'
    | 'figma'
    | 'intercom'
    | 'gitlab'
    | 'zapier'
    | 'jira'
    | 'googleSheets'
    | 'codex'
    | 'cursor'
    | 'githubCopilot'
    | 'factory'
    | 'sentryAgent'
    | 'devin'
    | 'chatPRD'
    | 'charlie'
    | 'cursorMCP'
    | 'chatGPT'
    | 'claude'
    | 'v0'
    | 'windsurf'
    | 'replit'
    | 'dust'
    | 'adk'
    | 'pagerDuty'
    | 'sentry'
    | 'vsCode'
    | 'datadog'
    | 'incidentIo'
    | 'raycast'
    | 'notion';

interface IntegrationDef {
    key: IntegrationKey;
    color: string;
}

type CategoryKey =
    | 'essentials'
    | 'agents'
    | 'aiClients'
    | 'engineering'
    | 'linearCrafted'
    | 'bugReporting'
    | 'automations'
    | 'customerExperience'
    | 'collaboration'
    | 'mediaDesign'
    | 'analytics'
    | 'securityCompliance';

interface CategoryDef {
    key: CategoryKey;
    integrations: IntegrationDef[];
}

const AVATAR_COLORS: Record<IntegrationKey, string> = {
    slack: 'bg-[#4A154B] text-white',
    linearAsksForSlack: 'bg-[#5E5CE6] text-white',
    github: 'bg-[#24292E] text-white',
    figma: 'bg-[#F24E1E] text-white',
    intercom: 'bg-[#1F8EED] text-white',
    gitlab: 'bg-[#FC6D26] text-white',
    zapier: 'bg-[#FF4A00] text-white',
    jira: 'bg-[#0052CC] text-white',
    googleSheets: 'bg-[#34A853] text-white',
    codex: 'bg-[#10A37F] text-white',
    cursor: 'bg-[#000000] text-white',
    githubCopilot: 'bg-[#24292E] text-white',
    factory: 'bg-[#7C3AED] text-white',
    sentryAgent: 'bg-[#362D59] text-white',
    devin: 'bg-[#0EA5E9] text-white',
    chatPRD: 'bg-[#F59E0B] text-white',
    charlie: 'bg-[#6366F1] text-white',
    cursorMCP: 'bg-[#374151] text-white',
    chatGPT: 'bg-[#10A37F] text-white',
    claude: 'bg-[#C47F3C] text-white',
    v0: 'bg-[#000000] text-white',
    windsurf: 'bg-[#06B6D4] text-white',
    replit: 'bg-[#F26207] text-white',
    dust: 'bg-[#1C1C1C] text-white',
    adk: 'bg-[#4285F4] text-white',
    pagerDuty: 'bg-[#06AC38] text-white',
    sentry: 'bg-[#362D59] text-white',
    vsCode: 'bg-[#007ACC] text-white',
    datadog: 'bg-[#632CA6] text-white',
    incidentIo: 'bg-[#EF4444] text-white',
    raycast: 'bg-[#FF6363] text-white',
    notion: 'bg-[#000000] text-white',
};

const CATEGORIES: CategoryDef[] = [
    {
        key: 'essentials',
        integrations: [
            { key: 'slack', color: AVATAR_COLORS.slack },
            { key: 'github', color: AVATAR_COLORS.github },
            { key: 'figma', color: AVATAR_COLORS.figma },
            { key: 'notion', color: AVATAR_COLORS.notion },
        ],
    },
    {
        key: 'agents',
        integrations: [
            { key: 'codex', color: AVATAR_COLORS.codex },
            { key: 'devin', color: AVATAR_COLORS.devin },
            { key: 'factory', color: AVATAR_COLORS.factory },
            { key: 'sentryAgent', color: AVATAR_COLORS.sentryAgent },
            { key: 'windsurf', color: AVATAR_COLORS.windsurf },
            { key: 'replit', color: AVATAR_COLORS.replit },
        ],
    },
    {
        key: 'aiClients',
        integrations: [
            { key: 'chatGPT', color: AVATAR_COLORS.chatGPT },
            { key: 'claude', color: AVATAR_COLORS.claude },
            { key: 'cursor', color: AVATAR_COLORS.cursor },
            { key: 'cursorMCP', color: AVATAR_COLORS.cursorMCP },
            { key: 'githubCopilot', color: AVATAR_COLORS.githubCopilot },
            { key: 'v0', color: AVATAR_COLORS.v0 },
            { key: 'dust', color: AVATAR_COLORS.dust },
            { key: 'adk', color: AVATAR_COLORS.adk },
        ],
    },
    {
        key: 'engineering',
        integrations: [
            { key: 'gitlab', color: AVATAR_COLORS.gitlab },
            { key: 'vsCode', color: AVATAR_COLORS.vsCode },
        ],
    },
    {
        key: 'linearCrafted',
        integrations: [
            { key: 'linearAsksForSlack', color: AVATAR_COLORS.linearAsksForSlack },
            { key: 'charlie', color: AVATAR_COLORS.charlie },
            { key: 'chatPRD', color: AVATAR_COLORS.chatPRD },
        ],
    },
    {
        key: 'bugReporting',
        integrations: [
            { key: 'sentry', color: AVATAR_COLORS.sentry },
            { key: 'datadog', color: AVATAR_COLORS.datadog },
        ],
    },
    {
        key: 'automations',
        integrations: [
            { key: 'zapier', color: AVATAR_COLORS.zapier },
            { key: 'googleSheets', color: AVATAR_COLORS.googleSheets },
        ],
    },
    {
        key: 'customerExperience',
        integrations: [
            { key: 'intercom', color: AVATAR_COLORS.intercom },
            { key: 'jira', color: AVATAR_COLORS.jira },
        ],
    },
    {
        key: 'collaboration',
        integrations: [{ key: 'raycast', color: AVATAR_COLORS.raycast }],
    },
    {
        key: 'mediaDesign',
        integrations: [{ key: 'figma', color: AVATAR_COLORS.figma }],
    },
    {
        key: 'analytics',
        integrations: [{ key: 'datadog', color: AVATAR_COLORS.datadog }],
    },
    {
        key: 'securityCompliance',
        integrations: [
            { key: 'pagerDuty', color: AVATAR_COLORS.pagerDuty },
            { key: 'incidentIo', color: AVATAR_COLORS.incidentIo },
        ],
    },
];

/* -------------------------------------------------------------------------- */
/* IntegrationCard                                                            */
/* -------------------------------------------------------------------------- */

function IntegrationCard({
    integrationKey,
    color,
    connected,
    onToggle,
}: {
    integrationKey: IntegrationKey;
    color: string;
    connected: boolean;
    onToggle: () => void;
}) {
    const { t } = useTranslation();
    const name = t(`settings.integrations.integrations.${integrationKey}.name`);
    const description = t(`settings.integrations.integrations.${integrationKey}.description`);
    const firstLetter = name.charAt(0).toUpperCase();

    return (
        <div className={cn(settingsSurface, 'flex flex-col gap-2.5 p-3')}>
            <div className="flex items-start gap-2.5">
                <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-md text-[13px] font-bold', color)}>{firstLetter}</div>
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold">{name}</div>
                    <div className="text-muted-foreground mt-0.5 line-clamp-2 text-[12px] leading-4">{description}</div>
                </div>
            </div>
            <Button
                variant={connected ? 'outline' : 'outline'}
                size="sm"
                className={cn('h-7 w-full px-3 text-[13px]', connected && 'text-foreground')}
                onClick={onToggle}
            >
                {connected ? t('settings.integrations.open') : t('settings.integrations.connect')}
            </Button>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function SettingsIntegrations() {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [connected, setConnected] = useState<Set<string>>(new Set());

    function toggleConnection(key: string, name: string) {
        setConnected((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
                toast.success({ title: t('settings.integrations.toastDisconnected', { name }) });
            } else {
                next.add(key);
                toast.success({ title: t('settings.integrations.toastConnected', { name }) });
            }
            return next;
        });
    }

    const filteredCategories = useMemo(() => {
        if (!search.trim()) return CATEGORIES;
        const q = search.toLowerCase();
        return CATEGORIES.map((cat) => ({
            ...cat,
            integrations: cat.integrations.filter((int) => {
                const name = t(`settings.integrations.integrations.${int.key}.name`).toLowerCase();
                const desc = t(`settings.integrations.integrations.${int.key}.description`).toLowerCase();
                return name.includes(q) || desc.includes(q);
            }),
        })).filter((cat) => cat.integrations.length > 0);
    }, [search, t]);

    const totalVisible = filteredCategories.reduce((acc, c) => acc + c.integrations.length, 0);

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.integrations.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.features')}
                title={t('settings.integrations.title')}
                description={t('settings.integrations.description')}
            />

            <SearchInput
                className="mb-6 max-w-sm"
                placeholder={t('settings.integrations.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {totalVisible === 0 ? (
                <EmptyState icon={Puzzle} title={t('settingsCommon.noResults')} description={t('settings.integrations.noResults')} />
            ) : (
                filteredCategories.map((cat) => (
                    <SettingsSection key={cat.key} title={t(`settings.integrations.categories.${cat.key}`)}>
                        <div className="grid grid-cols-2 gap-2">
                            {cat.integrations.map((int) => (
                                <IntegrationCard
                                    key={`${cat.key}-${int.key}`}
                                    integrationKey={int.key}
                                    color={int.color}
                                    connected={connected.has(`${cat.key}-${int.key}`)}
                                    onToggle={() =>
                                        toggleConnection(`${cat.key}-${int.key}`, t(`settings.integrations.integrations.${int.key}.name`))
                                    }
                                />
                            ))}
                        </div>
                    </SettingsSection>
                ))
            )}
        </LinearSettingsLayout>
    );
}
