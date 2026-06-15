import { SelectField, SettingsHeader, SettingsList, SettingsRow, SettingsSection, ToggleRow } from '@/components/linear/settings/kit';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CODE_SNIPPETS: Record<string, string> = {
    javascript: `function greet(name) {\n  return \`Hello, \${name}!\`;\n}\nconsole.log(greet('world'));`,
    typescript: `function greet(name: string): string {\n  return \`Hello, \${name}!\`;\n}\nconsole.log(greet('world'));`,
    python: `def greet(name: str) -> str:\n    return f"Hello, {name}!"\nprint(greet("world"))`,
    rust: `fn greet(name: &str) -> String {\n    format!("Hello, {}!", name)\n}\nfn main() { println!("{}", greet("world")); }`,
};

export default function SettingsCodeAndReviews() {
    const { t } = useTranslation();

    const [codeReviewsEnabled, setCodeReviewsEnabled] = useState(true);
    const [theme, setTheme] = useState('github');
    const [font, setFont] = useState('default');
    const [language, setLanguage] = useState('typescript');
    const [gitFormat, setGitFormat] = useState('branch');
    const [moveToBranchCopy, setMoveToBranchCopy] = useState(false);
    const [moveToOpenTool, setMoveToOpenTool] = useState(false);

    const themeOptions = [
        { value: 'github', label: t('settings.codeReviewsPage.editorPreferences.theme.github') },
        { value: 'dracula', label: t('settings.codeReviewsPage.editorPreferences.theme.dracula') },
        { value: 'monokai', label: t('settings.codeReviewsPage.editorPreferences.theme.monokai') },
        { value: 'solarized', label: t('settings.codeReviewsPage.editorPreferences.theme.solarized') },
    ];

    const fontOptions = [
        { value: 'default', label: t('settings.codeReviewsPage.editorPreferences.font.default') },
        { value: 'mono', label: t('settings.codeReviewsPage.editorPreferences.font.mono') },
        { value: 'serif', label: t('settings.codeReviewsPage.editorPreferences.font.serif') },
    ];

    const languageOptions = [
        { value: 'javascript', label: t('settings.codeReviewsPage.editorPreferences.language.javascript') },
        { value: 'typescript', label: t('settings.codeReviewsPage.editorPreferences.language.typescript') },
        { value: 'python', label: t('settings.codeReviewsPage.editorPreferences.language.python') },
        { value: 'rust', label: t('settings.codeReviewsPage.editorPreferences.language.rust') },
    ];

    const gitFormatOptions = [
        { value: 'branch', label: t('settings.codeReviewsPage.externalTools.gitFormat.branch') },
        { value: 'url', label: t('settings.codeReviewsPage.externalTools.gitFormat.url') },
        { value: 'markdown', label: t('settings.codeReviewsPage.externalTools.gitFormat.markdown') },
    ];

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.codeReviewsPage.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.personal')}
                title={t('settings.codeReviewsPage.title')}
                description={t('settings.codeReviewsPage.description')}
            />

            <SettingsSection>
                <SettingsList>
                    <ToggleRow
                        title={t('settings.codeReviewsPage.enableReviews.title')}
                        description={t('settings.codeReviewsPage.enableReviews.description')}
                        checked={codeReviewsEnabled}
                        onCheckedChange={setCodeReviewsEnabled}
                    />
                </SettingsList>
            </SettingsSection>

            <SettingsSection title={t('settings.codeReviewsPage.editorPreferences.title')}>
                <SettingsList>
                    <SettingsRow
                        title={t('settings.codeReviewsPage.editorPreferences.theme.title')}
                        description={t('settings.codeReviewsPage.editorPreferences.theme.description')}
                        control={<SelectField value={theme} onValueChange={setTheme} options={themeOptions} triggerClassName="w-36" />}
                    />
                    <SettingsRow
                        title={t('settings.codeReviewsPage.editorPreferences.font.title')}
                        description={t('settings.codeReviewsPage.editorPreferences.font.description')}
                        control={<SelectField value={font} onValueChange={setFont} options={fontOptions} triggerClassName="w-36" />}
                    />
                    <SettingsRow
                        title={t('settings.codeReviewsPage.editorPreferences.language.title')}
                        description={t('settings.codeReviewsPage.editorPreferences.language.description')}
                        control={<SelectField value={language} onValueChange={setLanguage} options={languageOptions} triggerClassName="w-36" />}
                    />
                </SettingsList>
                <div className="mt-3">
                    <p className="text-muted-foreground mb-1.5 text-[12px]">{t('settings.codeReviewsPage.codePreview')}</p>
                    <pre className="bg-muted/50 border-border/60 text-muted-foreground overflow-x-auto rounded-md border px-4 py-3 font-mono text-[12px] leading-5">
                        {CODE_SNIPPETS[language]}
                    </pre>
                </div>
            </SettingsSection>

            <SettingsSection title={t('settings.codeReviewsPage.externalTools.title')}>
                <SettingsList>
                    <SettingsRow
                        title={t('settings.codeReviewsPage.externalTools.gitFormat.title')}
                        description={t('settings.codeReviewsPage.externalTools.gitFormat.description')}
                        control={<SelectField value={gitFormat} onValueChange={setGitFormat} options={gitFormatOptions} triggerClassName="w-40" />}
                    />
                </SettingsList>
            </SettingsSection>

            <SettingsSection title={t('settings.codeReviewsPage.workflow.title')}>
                <SettingsList>
                    <ToggleRow
                        title={t('settings.codeReviewsPage.workflow.moveToBranchCopy.title')}
                        description={t('settings.codeReviewsPage.workflow.moveToBranchCopy.description')}
                        checked={moveToBranchCopy}
                        onCheckedChange={setMoveToBranchCopy}
                    />
                    <ToggleRow
                        title={t('settings.codeReviewsPage.workflow.moveToOpenTool.title')}
                        description={t('settings.codeReviewsPage.workflow.moveToOpenTool.description')}
                        checked={moveToOpenTool}
                        onCheckedChange={setMoveToOpenTool}
                    />
                </SettingsList>
            </SettingsSection>
        </LinearSettingsLayout>
    );
}
