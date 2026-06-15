import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import LinearSettingsLayout from '@/layouts/settings/linear-settings-layout';
import { type Label } from '@/lib/issues';
import { Head, router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

type LabelWithCount = Label & {
    issues_count: number;
};

const colors = ['#8B5CF6', '#10B981', '#EF4444', '#F59E0B', '#5E6AD2', '#14B8A6'];

export default function SettingsLabels({ labels }: { labels: LabelWithCount[] }) {
    const { t } = useTranslation();
    const form = useForm({ name: '', color: colors[0] });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!form.data.name.trim()) return;

        form.post('/settings/issues/labels', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success({ title: t('settings.labels.toastCreated') });
                form.reset('name');
            },
            onError: () => toast.error({ title: t('settings.labels.toastCreateFailed') }),
        });
    };

    return (
        <LinearSettingsLayout>
            <Head title={t('settings.labels.title')} />

            <div className="mb-8">
                <p className="text-muted-foreground mb-6 text-[13px]">{t('settings.labels.eyebrow')}</p>
                <h1 className="text-[22px] font-medium tracking-normal">{t('settings.labels.title')}</h1>
            </div>

            <form onSubmit={submit} className="border-border/80 mb-6 flex flex-col gap-2 rounded-lg border p-3 sm:flex-row">
                <input
                    value={form.data.name}
                    onChange={(event) => form.setData('name', event.target.value)}
                    placeholder={t('settings.labels.namePlaceholder')}
                    className="border-border focus:ring-ring h-8 flex-1 rounded-md border bg-transparent px-2.5 text-[13px] focus:ring-1 focus:outline-none"
                />
                <div className="flex items-center gap-1">
                    {colors.map((color) => (
                        <button
                            key={color}
                            type="button"
                            aria-label={t('settings.labels.useColor', { color })}
                            data-active={form.data.color === color || undefined}
                            onClick={() => form.setData('color', color)}
                            className="data-[active]:bg-accent flex size-7 items-center justify-center rounded-md"
                        >
                            <span className="size-3 rounded-full" style={{ backgroundColor: color }} />
                        </button>
                    ))}
                </div>
                <Button
                    type="submit"
                    size="sm"
                    loading={form.processing}
                    loadingText={t('settings.labels.creating')}
                    disabled={!form.data.name.trim()}
                    className="h-8 px-3 text-[13px]"
                >
                    {t('settings.labels.create')}
                </Button>
            </form>

            <div className="border-border/80 overflow-hidden rounded-lg border">
                {labels.map((label) => (
                    <div key={label.id} className="border-border/70 flex h-[46px] items-center gap-3 border-b px-4 last:border-b-0">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                        <span className="text-[13px] font-medium">{label.name}</span>
                        <span className="text-muted-foreground ml-auto text-[12px]">
                            {t('settings.labels.issuesCount', { count: label.issues_count })}
                        </span>
                        <button
                            aria-label={t('settings.labels.deleteLabel', { name: label.name })}
                            onClick={() =>
                                router.delete(`/settings/issues/labels/${label.id}`, {
                                    preserveScroll: true,
                                    onSuccess: () => toast.success({ title: t('settings.labels.toastDeleted') }),
                                    onError: () => toast.error({ title: t('settings.labels.toastDeleteFailed') }),
                                })
                            }
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex size-7 items-center justify-center rounded-md"
                        >
                            <Trash2 className="size-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </LinearSettingsLayout>
    );
}
