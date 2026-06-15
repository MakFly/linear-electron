import { ConfirmDialog, FieldCard, FieldRow, SettingsHeader, TextInput } from '@/components/linear/settings/kit';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { useInitials } from '@/hooks/use-initials';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsProfile() {
    const { t } = useTranslation();
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const [confirmLeave, setConfirmLeave] = useState(false);

    const { data, setData, patch, processing } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        title: '',
        username: auth.user.email.split('@')[0],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/settings/account/profile', {
            preserveScroll: true,
            onSuccess: () => toast.success({ title: t('settings.profilePage.toastSaved') }),
            onError: () => toast.error({ title: t('settings.profilePage.toastFailed') }),
        });
    };

    return (
        <LinearSettingsLayout>
            <Head title={t('settings.profilePage.title')} />
            <SettingsHeader eyebrow={t('settings.navGroups.personal')} title={t('settings.profilePage.title')} />

            <form onSubmit={submit}>
                <FieldCard>
                    {/* Profile picture */}
                    <FieldRow label={t('settings.profilePage.pictureLabel')}>
                        <div className="flex items-center gap-3">
                            <div className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-[14px] font-medium">
                                {auth.user.avatar ? (
                                    <img src={auth.user.avatar} alt={auth.user.name} className="size-9 rounded-full object-cover" />
                                ) : (
                                    getInitials(auth.user.name)
                                )}
                            </div>
                            <div>
                                <Button variant="outline" size="sm" className="h-7 px-3 text-[13px]" type="button">
                                    {t('settings.profilePage.changeAvatar')}
                                </Button>
                                <p className="text-muted-foreground mt-1 text-[12px]">{t('settings.profilePage.avatarHint')}</p>
                            </div>
                        </div>
                    </FieldRow>

                    {/* Email */}
                    <FieldRow label={t('settings.profilePage.emailLabel')}>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-[13px]">{data.email}</span>
                            <Button variant="outline" size="sm" className="h-7 px-3 text-[13px]" type="button">
                                {t('settings.profilePage.changeEmail')}
                            </Button>
                        </div>
                    </FieldRow>

                    {/* Full name */}
                    <FieldRow label={t('settings.profilePage.fullName')} htmlFor="name">
                        <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full sm:w-[240px]" />
                    </FieldRow>

                    {/* Job title */}
                    <FieldRow label={t('settings.profilePage.jobTitle')} description={t('settings.profilePage.jobTitlePlaceholder')} htmlFor="title">
                        <TextInput
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder={t('settings.profilePage.jobTitlePlaceholder')}
                            className="w-full sm:w-[240px]"
                        />
                    </FieldRow>

                    {/* Username */}
                    <FieldRow label={t('settings.profilePage.username')} htmlFor="username">
                        <TextInput
                            id="username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            className="w-full sm:w-[240px]"
                        />
                    </FieldRow>
                </FieldCard>

                <div className="mt-4">
                    <Button type="submit" size="sm" loading={processing} loadingText={t('settingsCommon.save')} className="h-8 px-3 text-[13px]">
                        {t('settingsCommon.update')}
                    </Button>
                </div>
            </form>

            {/* Workspace access */}
            <FieldCard title={t('settings.profilePage.workspaceAccess')} className="mt-10">
                <FieldRow label={t('settings.profilePage.removeYourself')} description={t('settings.profilePage.removeYourselfDesc')}>
                    <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        className="text-destructive border-destructive/40 h-7 px-3 text-[13px]"
                        onClick={() => setConfirmLeave(true)}
                    >
                        {t('settings.profilePage.removeYourself')}
                    </Button>
                </FieldRow>
                <FieldRow label={t('settings.profilePage.leaveWorkspace')} description={t('settings.profilePage.leaveWorkspaceDesc')}>
                    <Button variant="outline" size="sm" type="button" disabled className="h-7 px-3 text-[13px]">
                        {t('settings.profilePage.leaveWorkspace')}
                    </Button>
                </FieldRow>
            </FieldCard>

            <ConfirmDialog
                open={confirmLeave}
                onOpenChange={setConfirmLeave}
                title={t('settings.profilePage.removeYourself')}
                description={t('settings.profilePage.removeConfirm')}
                confirmLabel={t('settingsCommon.remove')}
                onConfirm={() => toast.success({ title: t('settings.profilePage.toastRemoved') })}
            />
        </LinearSettingsLayout>
    );
}
