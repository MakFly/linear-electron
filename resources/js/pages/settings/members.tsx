import {
    EmptyState,
    RowMenu,
    SearchInput,
    SelectField,
    SettingsHeader,
    SettingsList,
    StatusPill,
    settingsDivider,
} from '@/components/linear/settings/kit';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { Download, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type MemberStatus = 'Active' | 'Suspended' | 'Invited';
type MemberRole = 'Admin' | 'Member' | 'Guest';

interface Member {
    id: number;
    name: string;
    email: string;
    status: MemberStatus;
    teams: number;
    role: MemberRole;
}

const SEED_MEMBERS: Member[] = [
    { id: 1, name: 'Alice Martin', email: 'alice@devaubree.dev', status: 'Active', teams: 3, role: 'Admin' },
    { id: 2, name: 'Bob Chen', email: 'bob@devaubree.dev', status: 'Active', teams: 2, role: 'Member' },
    { id: 3, name: 'Clara Dupont', email: 'clara@devaubree.dev', status: 'Active', teams: 1, role: 'Member' },
    { id: 4, name: 'David Kim', email: 'david@devaubree.dev', status: 'Suspended', teams: 0, role: 'Member' },
    { id: 5, name: 'Eve Torres', email: 'eve@devaubree.dev', status: 'Invited', teams: 0, role: 'Member' },
];

let nextId = SEED_MEMBERS.length + 1;

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function SettingsMembers() {
    const { t } = useTranslation();

    const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<MemberRole>('Member');

    const filtered = members.filter((m) => {
        if (statusFilter === 'active' && m.status !== 'Active') return false;
        if (statusFilter === 'suspended' && m.status !== 'Suspended') return false;
        const q = search.toLowerCase();
        if (q && !m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) return false;
        return true;
    });

    const handleInvite = () => {
        if (!inviteEmail.trim()) return;
        setMembers((prev) => [
            ...prev,
            {
                id: nextId++,
                name: inviteEmail.trim(),
                email: inviteEmail.trim(),
                status: 'Invited',
                teams: 0,
                role: inviteRole,
            },
        ]);
        toast.success({ title: t('settings.members.toastInvited') });
        setInviteEmail('');
        setInviteRole('Member');
        setInviteOpen(false);
    };

    const handleSuspend = (id: number) => {
        setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'Suspended' } : m)));
    };

    const handleReactivate = (id: number) => {
        setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'Active' } : m)));
    };

    const handleRemove = (id: number) => {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        toast.success({ title: t('settings.members.toastRemoved') });
    };

    const handleRevoke = (id: number) => {
        setMembers((prev) => prev.filter((m) => m.id !== id));
    };

    const roleLabel = (role: MemberRole): string => {
        if (role === 'Admin') return t('settings.members.roleAdmin');
        if (role === 'Guest') return t('settings.members.roleGuest');
        return t('settings.members.roleMember');
    };

    const statusOptions = [
        { value: 'all', label: t('settings.members.statusAll') },
        { value: 'active', label: t('settings.members.statusActive') },
        { value: 'suspended', label: t('settings.members.statusSuspended') },
    ];

    const roleOptions: { value: MemberRole; label: string }[] = [
        { value: 'Member', label: t('settings.members.roleMember') },
        { value: 'Admin', label: t('settings.members.roleAdmin') },
        { value: 'Guest', label: t('settings.members.roleGuest') },
    ];

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.members.title')} />

            <SettingsHeader
                eyebrow={t('settings.navGroups.administration')}
                title={t('settings.members.title')}
                description={t('settings.members.description')}
                actions={
                    <div className="flex items-center gap-2">
                        <SelectField
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                            options={statusOptions}
                            triggerClassName="w-[140px]"
                        />
                        <SearchInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('settingsCommon.search')}
                            className="w-[200px]"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 text-[13px]"
                            onClick={() => toast.success({ title: t('settings.members.toastExported') })}
                        >
                            <Download className="mr-1.5 size-3.5" />
                            {t('settings.members.exportCsv')}
                        </Button>
                        <Button
                            size="sm"
                            className="h-7 px-3 text-[13px]"
                            onClick={() => setInviteOpen(true)}
                        >
                            <UserPlus className="mr-1.5 size-3.5" />
                            {t('settings.members.invite')}
                        </Button>
                    </div>
                }
            />

            {/* Table header */}
            <div className={cn(settingsDivider, 'bg-muted/30 mb-0 grid grid-cols-[2fr_2fr_1fr_1fr_1fr_40px] items-center gap-3 rounded-t-[11px] px-4 py-2 text-[12px] text-muted-foreground border')}>
                <span>{t('settings.members.columnName')}</span>
                <span>{t('settings.members.columnEmail')}</span>
                <span>{t('settings.members.columnStatus')}</span>
                <span>{t('settings.members.columnTeams')}</span>
                <span>{t('settings.members.columnRole')}</span>
                <span />
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title={t('settings.members.emptyTitle')}
                    description={t('settings.members.emptyDesc')}
                    className="rounded-t-none"
                />
            ) : (
                <SettingsList className="rounded-t-none border-t-0">
                    {filtered.map((member) => (
                        <div
                            key={member.id}
                            className={cn(settingsDivider, 'grid grid-cols-[2fr_2fr_1fr_1fr_1fr_40px] items-center gap-3 px-4 min-h-[46px] border-b last:border-b-0 text-[13px]')}
                        >
                            {/* Name */}
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="bg-muted size-7 rounded-full text-[11px] font-medium flex items-center justify-center shrink-0">
                                    {getInitials(member.name)}
                                </span>
                                <span className="truncate font-medium">{member.name}</span>
                            </div>

                            {/* Email */}
                            <span className="text-muted-foreground truncate">{member.email}</span>

                            {/* Status */}
                            <div>
                                {member.status === 'Active' && (
                                    <StatusPill on={true} onLabel={t('settings.members.statusPillActive')} />
                                )}
                                {member.status === 'Invited' && (
                                    <StatusPill on={false} offLabel={t('settings.members.statusPillInvited')} />
                                )}
                                {member.status === 'Suspended' && (
                                    <span className="inline-flex items-center text-[11px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                                        {t('settings.members.statusPillSuspended')}
                                    </span>
                                )}
                            </div>

                            {/* Teams */}
                            <span className="text-muted-foreground">{member.teams}</span>

                            {/* Role */}
                            <span>{roleLabel(member.role)}</span>

                            {/* Actions */}
                            <div className="flex justify-end">
                                {member.status === 'Active' && (
                                    <RowMenu
                                        items={[
                                            {
                                                label: t('settings.members.menuSuspend'),
                                                onSelect: () => handleSuspend(member.id),
                                            },
                                            {
                                                label: t('settings.members.menuRemove'),
                                                onSelect: () => handleRemove(member.id),
                                                destructive: true,
                                                separatorBefore: true,
                                            },
                                        ]}
                                    />
                                )}
                                {member.status === 'Invited' && (
                                    <RowMenu
                                        items={[
                                            {
                                                label: t('settings.members.menuRevoke'),
                                                onSelect: () => handleRevoke(member.id),
                                                destructive: true,
                                            },
                                        ]}
                                    />
                                )}
                                {member.status === 'Suspended' && (
                                    <RowMenu
                                        items={[
                                            {
                                                label: t('settings.members.menuReactivate'),
                                                onSelect: () => handleReactivate(member.id),
                                            },
                                            {
                                                label: t('settings.members.menuRemove'),
                                                onSelect: () => handleRemove(member.id),
                                                destructive: true,
                                                separatorBefore: true,
                                            },
                                        ]}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </SettingsList>
            )}

            {/* Invite Dialog */}
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">{t('settings.members.dialogTitle')}</DialogTitle>
                        <DialogDescription className="sr-only">
                            {t('settings.members.dialogTitle')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-2">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="invite-email" className="text-[13px] font-medium">
                                {t('settings.members.emailLabel')}
                            </label>
                            <input
                                id="invite-email"
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="border-border focus:ring-ring h-8 rounded-md border bg-transparent px-2.5 text-[13px] focus:ring-1 focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="invite-role" className="text-[13px] font-medium">
                                {t('settings.members.roleLabel')}
                            </label>
                            <SelectField
                                value={inviteRole}
                                onValueChange={(v) => setInviteRole(v as MemberRole)}
                                options={roleOptions}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setInviteOpen(false)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleInvite} disabled={!inviteEmail.trim()}>
                            {t('settings.members.invite')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LinearSettingsLayout>
    );
}
