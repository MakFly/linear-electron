import { Button } from '@/components/ui/button';
import {
    ConfirmDialog,
    EmptyState,
    RowMenu,
    SelectField,
    SettingsField,
    SettingsHeader,
    SettingsList,
    SettingsRow,
    SettingsSection,
    Switch,
    TextInput,
    ToggleRow,
} from '@/components/linear/settings/kit';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { Head } from '@inertiajs/react';
import { Plus, Tag, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

interface CustomerStatus {
    id: number;
    name: string;
    color: string;
}

interface CustomerTier {
    id: number;
    name: string;
}

let nextStatusId = 10;
let nextTierId = 10;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const DEFAULT_STATUSES: CustomerStatus[] = [
    { id: 1, name: 'active', color: 'bg-emerald-500' },
    { id: 2, name: 'prospect', color: 'bg-yellow-400' },
    { id: 3, name: 'churned', color: 'bg-red-500' },
    { id: 4, name: 'lost', color: 'bg-gray-400' },
];

function StatusDot({ color }: { color: string }) {
    return <span className={`size-2.5 rounded-full shrink-0 ${color}`} />;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function CustomerRequests() {
    const { t } = useTranslation();

    // --- Enable toggle ---
    const [enabled, setEnabled] = useState(false);

    // --- Issue routing ---
    const [defaultTeam, setDefaultTeam] = useState('engineering');

    // --- Customer statuses ---
    const [statuses, setStatuses] = useState<CustomerStatus[]>(DEFAULT_STATUSES);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [newStatusName, setNewStatusName] = useState('');
    const [deleteStatusId, setDeleteStatusId] = useState<number | null>(null);

    // --- Customer tiers ---
    const [tiers, setTiers] = useState<CustomerTier[]>([]);
    const [tierDialogOpen, setTierDialogOpen] = useState(false);
    const [newTierName, setNewTierName] = useState('');

    // --- Display options ---
    const [revenueFormat, setRevenueFormat] = useState('compact');
    const [currency, setCurrency] = useState('usd');

    // --- Customer attributes ---
    const [dataSource, setDataSource] = useState('external');
    const [allowManualEdits, setAllowManualEdits] = useState(false);

    // --- Excluded domains ---
    const [excludedDomains, setExcludedDomains] = useState<string[]>([]);
    const [excludedDialogOpen, setExcludedDialogOpen] = useState(false);
    const [newExcluded, setNewExcluded] = useState('');

    // --- Generic domains ---
    const [genericDomains, setGenericDomains] = useState<string[]>([]);
    const [genericDialogOpen, setGenericDialogOpen] = useState(false);
    const [newGeneric, setNewGeneric] = useState('');

    /* ------------------------------------------------------------------ */
    /* Handlers                                                             */
    /* ------------------------------------------------------------------ */

    const handleCreateStatus = () => {
        if (!newStatusName.trim()) return;
        setStatuses((prev) => [
            ...prev,
            { id: nextStatusId++, name: newStatusName.trim(), color: 'bg-gray-400' },
        ]);
        setNewStatusName('');
        setStatusDialogOpen(false);
    };

    const handleDeleteStatus = (id: number) => {
        setStatuses((prev) => prev.filter((s) => s.id !== id));
    };

    const handleCreateTier = () => {
        if (!newTierName.trim()) return;
        setTiers((prev) => [...prev, { id: nextTierId++, name: newTierName.trim() }]);
        setNewTierName('');
        setTierDialogOpen(false);
    };

    const handleAddExcluded = () => {
        if (!newExcluded.trim()) return;
        setExcludedDomains((prev) => [...prev, newExcluded.trim()]);
        setNewExcluded('');
        setExcludedDialogOpen(false);
    };

    const handleAddGeneric = () => {
        if (!newGeneric.trim()) return;
        setGenericDomains((prev) => [...prev, newGeneric.trim()]);
        setNewGeneric('');
        setGenericDialogOpen(false);
    };

    /* ------------------------------------------------------------------ */
    /* Render                                                               */
    /* ------------------------------------------------------------------ */

    return (
        <LinearSettingsLayout comingSoon>
            <Head title={t('settings.customerRequests.title')} />

            <SettingsHeader
                eyebrow={t('settings.navGroups.features')}
                title={t('settings.customerRequests.title')}
                description={t('settings.customerRequests.description')}
            />

            {/* 1. Enable toggle */}
            <SettingsSection>
                <SettingsList>
                    <ToggleRow
                        title={t('settings.customerRequests.enable.title')}
                        description={t('settings.customerRequests.enable.desc')}
                        checked={enabled}
                        onCheckedChange={setEnabled}
                    />
                </SettingsList>
            </SettingsSection>

            {/* 2. Manage customers */}
            <SettingsSection title={t('settings.customerRequests.sections.manageCustomers')}>
                <EmptyState
                    icon={Users}
                    title={t('settings.customerRequests.customers.emptyTitle')}
                    description={t('settings.customerRequests.customers.emptyDesc')}
                    action={
                        <Button size="sm" className="h-7 px-3 text-[13px]">
                            <Plus className="mr-1 size-3.5" />
                            {t('settings.customerRequests.customers.addBtn')}
                        </Button>
                    }
                />
            </SettingsSection>

            {/* 3. Issue routing */}
            <SettingsSection title={t('settings.customerRequests.sections.issueRouting')}>
                <SettingsField label={t('settings.customerRequests.routing.defaultTeam')}>
                    <SelectField
                        value={defaultTeam}
                        onValueChange={setDefaultTeam}
                        options={[
                            { value: 'engineering', label: t('settings.customerRequests.routing.engineering') },
                            { value: 'design', label: t('settings.customerRequests.routing.design') },
                            { value: 'product', label: t('settings.customerRequests.routing.product') },
                        ]}
                    />
                </SettingsField>
            </SettingsSection>

            {/* 4. Customer statuses */}
            <SettingsSection
                title={t('settings.customerRequests.sections.customerStatuses')}
                actions={
                    <Button
                        size="sm"
                        className="h-7 px-3 text-[13px]"
                        onClick={() => setStatusDialogOpen(true)}
                    >
                        <Plus className="mr-1 size-3.5" />
                        {t('settings.customerRequests.statuses.createBtn')}
                    </Button>
                }
            >
                <SettingsList>
                    {statuses.map((status) => (
                        <SettingsRow
                            key={status.id}
                            iconNode={<StatusDot color={status.color} />}
                            title={
                                status.id <= 4
                                    ? t(`settings.customerRequests.statuses.${status.name}`)
                                    : status.name
                            }
                            control={
                                <RowMenu
                                    items={[
                                        {
                                            label: t('settingsCommon.edit'),
                                            onSelect: () => {},
                                        },
                                        {
                                            label: t('settingsCommon.delete'),
                                            destructive: true,
                                            separatorBefore: true,
                                            onSelect: () => setDeleteStatusId(status.id),
                                        },
                                    ]}
                                />
                            }
                        />
                    ))}
                </SettingsList>
            </SettingsSection>

            {/* 5. Customer tiers */}
            <SettingsSection
                title={t('settings.customerRequests.sections.customerTiers')}
                actions={
                    tiers.length > 0 ? (
                        <Button
                            size="sm"
                            className="h-7 px-3 text-[13px]"
                            onClick={() => setTierDialogOpen(true)}
                        >
                            <Plus className="mr-1 size-3.5" />
                            {t('settings.customerRequests.tiers.createBtn')}
                        </Button>
                    ) : undefined
                }
            >
                {tiers.length === 0 ? (
                    <EmptyState
                        icon={Tag}
                        title={t('settings.customerRequests.tiers.emptyTitle')}
                        description={t('settings.customerRequests.tiers.emptyDesc')}
                        action={
                            <Button
                                size="sm"
                                className="h-7 px-3 text-[13px]"
                                onClick={() => setTierDialogOpen(true)}
                            >
                                <Plus className="mr-1 size-3.5" />
                                {t('settings.customerRequests.tiers.createBtn')}
                            </Button>
                        }
                    />
                ) : (
                    <SettingsList>
                        {tiers.map((tier) => (
                            <ToggleRow
                                key={tier.id}
                                title={tier.name}
                                checked={false}
                                onCheckedChange={() => {}}
                            />
                        ))}
                    </SettingsList>
                )}
            </SettingsSection>

            {/* 6. Display options */}
            <SettingsSection title={t('settings.customerRequests.sections.displayOptions')}>
                <SettingsField label={t('settings.customerRequests.display.revenueFormat')}>
                    <SelectField
                        value={revenueFormat}
                        onValueChange={setRevenueFormat}
                        options={[
                            { value: 'compact', label: t('settings.customerRequests.display.compact') },
                            { value: 'full', label: t('settings.customerRequests.display.full') },
                        ]}
                    />
                </SettingsField>
                <SettingsField label={t('settings.customerRequests.display.currency')}>
                    <SelectField
                        value={currency}
                        onValueChange={setCurrency}
                        options={[
                            { value: 'usd', label: t('settings.customerRequests.display.usd') },
                            { value: 'eur', label: t('settings.customerRequests.display.eur') },
                            { value: 'gbp', label: t('settings.customerRequests.display.gbp') },
                        ]}
                    />
                </SettingsField>
            </SettingsSection>

            {/* 7. Customer attributes */}
            <SettingsSection title={t('settings.customerRequests.sections.customerAttributes')}>
                <SettingsField label={t('settings.customerRequests.attributes.dataSource')}>
                    <SelectField
                        value={dataSource}
                        onValueChange={setDataSource}
                        options={[
                            { value: 'external', label: t('settings.customerRequests.attributes.externalSource') },
                            { value: 'manual', label: t('settings.customerRequests.attributes.manual') },
                        ]}
                    />
                </SettingsField>
                <SettingsList>
                    <ToggleRow
                        title={t('settings.customerRequests.attributes.allowManualEdits')}
                        description={t('settings.customerRequests.attributes.allowManualEditsDesc')}
                        checked={allowManualEdits}
                        onCheckedChange={setAllowManualEdits}
                    />
                </SettingsList>
            </SettingsSection>

            {/* 8. Excluded domains/emails */}
            <SettingsSection
                title={t('settings.customerRequests.sections.excludedDomains')}
                actions={
                    <Button
                        size="sm"
                        className="h-7 px-3 text-[13px]"
                        onClick={() => setExcludedDialogOpen(true)}
                    >
                        <Plus className="mr-1 size-3.5" />
                        {t('settingsCommon.add')}
                    </Button>
                }
            >
                {excludedDomains.length === 0 ? (
                    <EmptyState
                        title={t('settings.customerRequests.excludedDomains.emptyTitle')}
                        action={
                            <Button
                                size="sm"
                                className="h-7 px-3 text-[13px]"
                                onClick={() => setExcludedDialogOpen(true)}
                            >
                                <Plus className="mr-1 size-3.5" />
                                {t('settings.customerRequests.excludedDomains.addBtn')}
                            </Button>
                        }
                    />
                ) : (
                    <SettingsList>
                        {excludedDomains.map((domain) => (
                            <ToggleRow
                                key={domain}
                                title={domain}
                                checked={false}
                                onCheckedChange={() => {}}
                            />
                        ))}
                    </SettingsList>
                )}
            </SettingsSection>

            {/* 9. Generic domains/emails */}
            <SettingsSection
                title={t('settings.customerRequests.sections.genericDomains')}
                actions={
                    <Button
                        size="sm"
                        className="h-7 px-3 text-[13px]"
                        onClick={() => setGenericDialogOpen(true)}
                    >
                        <Plus className="mr-1 size-3.5" />
                        {t('settingsCommon.add')}
                    </Button>
                }
            >
                {genericDomains.length === 0 ? (
                    <EmptyState
                        title={t('settings.customerRequests.genericDomains.emptyTitle')}
                        action={
                            <Button
                                size="sm"
                                className="h-7 px-3 text-[13px]"
                                onClick={() => setGenericDialogOpen(true)}
                            >
                                <Plus className="mr-1 size-3.5" />
                                {t('settings.customerRequests.genericDomains.addBtn')}
                            </Button>
                        }
                    />
                ) : (
                    <SettingsList>
                        {genericDomains.map((domain) => (
                            <ToggleRow
                                key={domain}
                                title={domain}
                                checked={false}
                                onCheckedChange={() => {}}
                            />
                        ))}
                    </SettingsList>
                )}
            </SettingsSection>

            {/* ---------------------------------------------------------------- */}
            {/* Dialogs                                                          */}
            {/* ---------------------------------------------------------------- */}

            {/* Create customer status */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">
                            {t('settings.customerRequests.statuses.dialogTitle')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <TextInput
                            value={newStatusName}
                            onChange={(e) => setNewStatusName(e.target.value)}
                            placeholder={t('settings.customerRequests.statuses.namePlaceholder')}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateStatus()}
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setStatusDialogOpen(false)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleCreateStatus} disabled={!newStatusName.trim()}>
                            {t('settingsCommon.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete customer status */}
            <ConfirmDialog
                open={deleteStatusId !== null}
                onOpenChange={(open) => !open && setDeleteStatusId(null)}
                title={t('settings.customerRequests.statuses.deleteTitle')}
                description={t('settings.customerRequests.statuses.deleteDesc')}
                onConfirm={() => {
                    if (deleteStatusId !== null) handleDeleteStatus(deleteStatusId);
                    setDeleteStatusId(null);
                }}
            />

            {/* Create customer tier */}
            <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">
                            {t('settings.customerRequests.tiers.dialogTitle')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <TextInput
                            value={newTierName}
                            onChange={(e) => setNewTierName(e.target.value)}
                            placeholder={t('settings.customerRequests.tiers.namePlaceholder')}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateTier()}
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setTierDialogOpen(false)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleCreateTier} disabled={!newTierName.trim()}>
                            {t('settingsCommon.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add excluded domain */}
            <Dialog open={excludedDialogOpen} onOpenChange={setExcludedDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">
                            {t('settings.customerRequests.excludedDomains.dialogTitle')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <TextInput
                            value={newExcluded}
                            onChange={(e) => setNewExcluded(e.target.value)}
                            placeholder={t('settings.customerRequests.excludedDomains.placeholder')}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddExcluded()}
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setExcludedDialogOpen(false)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleAddExcluded} disabled={!newExcluded.trim()}>
                            {t('settingsCommon.add')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add generic domain */}
            <Dialog open={genericDialogOpen} onOpenChange={setGenericDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">
                            {t('settings.customerRequests.genericDomains.dialogTitle')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <TextInput
                            value={newGeneric}
                            onChange={(e) => setNewGeneric(e.target.value)}
                            placeholder={t('settings.customerRequests.genericDomains.placeholder')}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddGeneric()}
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setGenericDialogOpen(false)}>
                            {t('settingsCommon.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleAddGeneric} disabled={!newGeneric.trim()}>
                            {t('settingsCommon.add')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LinearSettingsLayout>
    );
}
