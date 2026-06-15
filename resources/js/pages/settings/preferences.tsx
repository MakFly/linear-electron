import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import i18n from '@/lib/i18n';
import { defaultPreferences, storePreferences } from '@/lib/preferences';
import { cn } from '@/lib/utils';
import { type LinearPreferences } from '@/types';
import { Head, router } from '@inertiajs/react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

type PreferenceOption = {
    value: string;
    label: string;
};

// `label` holds an i18n key; resolved with t() at render time in PreferenceSelect.
const homeOptions: PreferenceOption[] = [
    { value: 'active', label: 'preferences.options.home.active' },
    { value: 'my-issues', label: 'preferences.options.home.myIssues' },
    { value: 'inbox', label: 'preferences.options.home.inbox' },
];

const displayNameOptions: PreferenceOption[] = [
    { value: 'full', label: 'preferences.options.displayNames.full' },
    { value: 'short', label: 'preferences.options.displayNames.short' },
    { value: 'username', label: 'preferences.options.displayNames.username' },
];

const weekOptions: PreferenceOption[] = [
    { value: 'sunday', label: 'preferences.options.week.sunday' },
    { value: 'monday', label: 'preferences.options.week.monday' },
];

const commentOptions: PreferenceOption[] = [
    { value: 'enter', label: 'preferences.options.comment.enter' },
    { value: 'mod-enter', label: 'preferences.options.comment.modEnter' },
];

const fontOptions: PreferenceOption[] = [
    { value: 'small', label: 'preferences.options.font.small' },
    { value: 'default', label: 'preferences.options.font.default' },
    { value: 'large', label: 'preferences.options.font.large' },
];

const themeOptions: PreferenceOption[] = [
    { value: 'light', label: 'preferences.options.theme.light' },
    { value: 'dark', label: 'preferences.options.theme.dark' },
    { value: 'system', label: 'preferences.options.theme.system' },
];

export default function Preferences({ preferences: serverPreferences }: { preferences: LinearPreferences }) {
    const { t } = useTranslation();
    const [preferences, setPreferences] = useState<LinearPreferences>({
        ...defaultPreferences,
        ...serverPreferences,
    });

    const languageOptions: PreferenceOption[] = [
        { value: 'en', label: 'preferences.english' },
        { value: 'fr', label: 'preferences.french' },
    ];

    const changeLanguage = (value: LinearPreferences['language']) => {
        i18n.changeLanguage(value);
        updatePreference('language', value);
    };

    const updatePreference = <Key extends keyof LinearPreferences>(key: Key, value: LinearPreferences[Key]) => {
        const next = {
            ...preferences,
            [key]: value,
        };

        setPreferences(next);
        storePreferences(next);
        router.patch(
            route('settings.preferences.update'),
            { [key]: value },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => toast.success({ title: t('preferences.toastSaved') }),
                onError: () => toast.error({ title: t('preferences.toastFailed') }),
            },
        );
    };

    return (
        <LinearSettingsLayout>
            <Head title={t('preferences.title')} />

            <div className="mb-8">
                <a href="/" className="text-muted-foreground hover:text-foreground mb-4 inline-flex text-[13px] md:hidden">
                    ‹ {t('preferences.backToApp')}
                </a>
                <p className="text-muted-foreground mb-6 text-[13px]">{t('preferences.eyebrow')}</p>
                <h1 className="text-[22px] font-medium tracking-normal">{t('preferences.title')}</h1>
            </div>

            <PreferenceSection title={t('preferences.sections.general')}>
                <SettingRow label={t('preferences.language')} description={t('preferences.languageDescription')}>
                    <PreferenceSelect
                        label={t('preferences.language')}
                        value={preferences.language}
                        options={languageOptions}
                        onValueChange={(value) => changeLanguage(value as LinearPreferences['language'])}
                    />
                </SettingRow>

                <SettingRow label={t('preferences.rows.defaultHomeView.label')} description={t('preferences.rows.defaultHomeView.description')}>
                    <PreferenceSelect
                        label={t('preferences.rows.defaultHomeView.label')}
                        value={preferences.default_home_view}
                        options={homeOptions}
                        onValueChange={(value) => updatePreference('default_home_view', value as LinearPreferences['default_home_view'])}
                    />
                </SettingRow>

                <SettingRow label={t('preferences.rows.displayNames.label')} description={t('preferences.rows.displayNames.description')}>
                    <PreferenceSelect
                        label={t('preferences.rows.displayNames.label')}
                        value={preferences.display_names}
                        options={displayNameOptions}
                        onValueChange={(value) => updatePreference('display_names', value as LinearPreferences['display_names'])}
                    />
                </SettingRow>

                <SettingRow label={t('preferences.rows.firstDayOfWeek.label')} description={t('preferences.rows.firstDayOfWeek.description')}>
                    <PreferenceSelect
                        label={t('preferences.rows.firstDayOfWeek.label')}
                        value={preferences.first_day_of_week}
                        options={weekOptions}
                        onValueChange={(value) => updatePreference('first_day_of_week', value as LinearPreferences['first_day_of_week'])}
                    />
                </SettingRow>

                <SettingRow label={t('preferences.rows.convertEmoticons.label')} description={t('preferences.rows.convertEmoticons.description')}>
                    <PreferenceSwitch
                        label={t('preferences.rows.convertEmoticons.label')}
                        checked={preferences.convert_emoticons}
                        onCheckedChange={(checked) => updatePreference('convert_emoticons', checked)}
                    />
                </SettingRow>

                <SettingRow label={t('preferences.rows.sendCommentOn.label')} description={t('preferences.rows.sendCommentOn.description')}>
                    <PreferenceSelect
                        label={t('preferences.rows.sendCommentOn.label')}
                        value={preferences.send_comment_on}
                        options={commentOptions}
                        onValueChange={(value) => updatePreference('send_comment_on', value as LinearPreferences['send_comment_on'])}
                    />
                </SettingRow>
            </PreferenceSection>

            <PreferenceSection title={t('preferences.sections.interfaceTheme')}>
                <SettingRow label={t('preferences.rows.appSidebar.label')} description={t('preferences.rows.appSidebar.description')}>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="border-border/80 h-8 rounded-md px-3 text-[13px]">
                                {t('preferences.customize')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-border bg-popover max-w-[420px] rounded-lg">
                            <DialogHeader>
                                <DialogTitle>{t('preferences.customizeSidebarTitle')}</DialogTitle>
                                <DialogDescription>{t('preferences.customizeSidebarDescription')}</DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </SettingRow>

                <SettingRow label={t('preferences.rows.fontSize.label')} description={t('preferences.rows.fontSize.description')}>
                    <PreferenceSelect
                        label={t('preferences.rows.fontSize.label')}
                        value={preferences.font_size}
                        options={fontOptions}
                        onValueChange={(value) => updatePreference('font_size', value as LinearPreferences['font_size'])}
                    />
                </SettingRow>

                <SettingRow label={t('preferences.rows.pointerCursors.label')} description={t('preferences.rows.pointerCursors.description')}>
                    <PreferenceSwitch
                        label={t('preferences.rows.pointerCursors.label')}
                        checked={preferences.pointer_cursors}
                        onCheckedChange={(checked) => updatePreference('pointer_cursors', checked)}
                    />
                </SettingRow>

                <SettingRow label={t('preferences.rows.interfaceTheme.label')} description={t('preferences.rows.interfaceTheme.description')}>
                    <PreferenceSelect
                        label={t('preferences.rows.interfaceTheme.label')}
                        value={preferences.interface_theme}
                        options={themeOptions}
                        onValueChange={(value) => updatePreference('interface_theme', value as LinearPreferences['interface_theme'])}
                    />
                </SettingRow>
            </PreferenceSection>

            <PreferenceSection title={t('preferences.sections.desktop')}>
                <SettingRow label={t('preferences.rows.openInDesktop.label')} description={t('preferences.rows.openInDesktop.description')}>
                    <PreferenceSwitch
                        label={t('preferences.rows.openInDesktop.label')}
                        checked={preferences.open_in_desktop_app}
                        onCheckedChange={(checked) => updatePreference('open_in_desktop_app', checked)}
                    />
                </SettingRow>
            </PreferenceSection>
        </LinearSettingsLayout>
    );
}

function PreferenceSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="mb-12">
            <h2 className="mb-4 text-[15px] font-medium tracking-normal">{title}</h2>
            <div className="border-border/80 bg-background overflow-hidden rounded-lg border">{children}</div>
        </section>
    );
}

function SettingRow({ label, description, children }: { label: string; description: ReactNode; children: ReactNode }) {
    return (
        <div className="border-border/70 flex min-h-[65px] flex-col items-stretch justify-between gap-3 border-b px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-6">
            <div className="min-w-0">
                <div className="text-[13px] leading-5 font-medium">{label}</div>
                <div className="text-muted-foreground mt-0.5 text-[12px] leading-4">{description}</div>
            </div>
            <div className="w-full shrink-0 sm:w-auto">{children}</div>
        </div>
    );
}

function PreferenceSelect({
    label,
    value,
    options,
    onValueChange,
}: {
    label: string;
    value: string;
    options: PreferenceOption[];
    onValueChange: (value: string) => void;
}) {
    const { t } = useTranslation();
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger
                aria-label={label}
                className="border-border/80 bg-secondary/50 focus:ring-ring h-8 w-full rounded-md px-2.5 text-[13px] shadow-none focus:ring-1 focus:ring-offset-0 sm:w-[150px]"
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" className="border-border bg-popover rounded-md">
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="h-[30px] text-[13px]">
                        {t(option.label)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function PreferenceSwitch({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-label={label}
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                'focus:ring-ring relative block h-5 w-[30px] rounded-full border transition-colors focus:ring-1 focus:outline-hidden',
                checked ? 'border-[#5e6ad2] bg-[#5e6ad2]' : 'border-border bg-muted',
            )}
        >
            <span
                className={cn(
                    'absolute top-1/2 left-0.5 size-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform',
                    checked ? 'translate-x-2.5' : 'translate-x-0',
                )}
            />
        </button>
    );
}
