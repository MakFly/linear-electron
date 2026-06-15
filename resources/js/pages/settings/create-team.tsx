import {
    FieldCard,
    FieldRow,
    SelectField,
    SettingsHeader,
    TextInput,
} from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function toIdentifier(name: string): string {
    return name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 5);
}

export default function SettingsCreateTeam() {
    const { t } = useTranslation();
    const [teamName, setTeamName] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [copyFrom, setCopyFrom] = useState('none');

    const handleNameChange = (value: string) => {
        setTeamName(value);
        setIdentifier(toIdentifier(value));
    };

    const handleCreate = () => {
        if (!teamName.trim()) return;
        toast.success({ title: t('settings.createTeam.createToast') });
        setTeamName('');
        setIdentifier('');
        setVisibility('public');
        setCopyFrom('none');
    };

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.createTeam.title')} />
            <SettingsHeader
                eyebrow={t('settings.navGroups.yourTeams')}
                title={t('settings.createTeam.title')}
                description={t('settings.createTeam.description')}
            />

            <FieldCard>
                <FieldRow label={t('settings.createTeam.teamNameLabel')} htmlFor="team-name">
                    <TextInput
                        id="team-name"
                        value={teamName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder={t('settings.createTeam.teamNamePlaceholder')}
                        className="w-full sm:w-[240px]"
                    />
                </FieldRow>

                <FieldRow
                    label={t('settings.createTeam.identifierLabel')}
                    description={t('settings.createTeam.identifierDescription')}
                    htmlFor="team-identifier"
                >
                    <TextInput
                        id="team-identifier"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
                        placeholder="ENG"
                        className="w-full sm:w-[120px]"
                    />
                </FieldRow>

                <FieldRow label={t('settings.createTeam.visibilityLabel')}>
                    <SelectField
                        value={visibility}
                        onValueChange={setVisibility}
                        options={[
                            { value: 'public', label: t('settings.createTeam.visibilityPublic') },
                            { value: 'private', label: t('settings.createTeam.visibilityPrivate') },
                        ]}
                        triggerClassName="w-full sm:w-[180px]"
                    />
                </FieldRow>

                <FieldRow label={t('settings.createTeam.copySettingsLabel')}>
                    <SelectField
                        value={copyFrom}
                        onValueChange={setCopyFrom}
                        options={[
                            { value: 'none', label: t('settings.createTeam.copySettingsNone') },
                            { value: 'devaubree', label: t('settings.createTeam.copySettingsDevaubree') },
                        ]}
                        triggerClassName="w-full sm:w-[180px]"
                    />
                </FieldRow>
            </FieldCard>

            <div className="mt-4">
                <Button
                    size="sm"
                    className="h-7 px-3 text-[13px]"
                    onClick={handleCreate}
                    disabled={!teamName.trim()}
                >
                    {t('settings.createTeam.createButton')}
                </Button>
            </div>
        </LinearSettingsLayout>
    );
}
