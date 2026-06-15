/**
 * Reusable Linear-like settings primitives. Dense layout, subtle borders,
 * 13px body text. Import these into every `pages/settings/**` page so the
 * whole section stays visually consistent.
 *
 * Visual tokens:
 *  - page title: text-[22px] font-medium
 *  - eyebrow / descriptions: text-muted-foreground text-[13px]
 *  - borders: border-border/80, rounded-lg
 *  - rows: min-h-[46px], gap-3, px-4
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Check, MoreHorizontal, Search, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/* -------------------------------------------------------------------------- */
/* Page header                                                                */
/* -------------------------------------------------------------------------- */

export function SettingsHeader({
    eyebrow,
    title,
    description,
    actions,
}: {
    eyebrow?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <header className="mb-8">
            {eyebrow ? <p className="text-muted-foreground mb-6 text-[13px]">{eyebrow}</p> : null}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-[22px] font-medium tracking-normal">{title}</h1>
                    {description ? <p className="text-muted-foreground mt-2 max-w-xl text-[13px] leading-5">{description}</p> : null}
                </div>
                {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
            </div>
        </header>
    );
}

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */

export function SettingsSection({
    title,
    description,
    actions,
    children,
    className,
}: {
    title?: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    children?: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn('mb-10', className)}>
            {(title || actions) && (
                <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                        {title ? <h2 className="text-[15px] font-medium">{title}</h2> : null}
                        {description ? <p className="text-muted-foreground mt-1 max-w-xl text-[13px] leading-5">{description}</p> : null}
                    </div>
                    {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
                </div>
            )}
            {!title && description ? <p className="text-muted-foreground mb-3 max-w-xl text-[13px] leading-5">{description}</p> : null}
            {children}
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* Switch (iOS-style)                                                         */
/* -------------------------------------------------------------------------- */

export function Switch({
    checked,
    onCheckedChange,
    disabled,
    'aria-label': ariaLabel,
}: {
    checked: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    'aria-label'?: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={() => onCheckedChange?.(!checked)}
            className={cn(
                'focus-visible:ring-ring relative inline-flex h-[18px] w-[30px] shrink-0 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                checked ? 'bg-primary' : 'bg-muted-foreground/30',
            )}
        >
            <span
                className={cn(
                    'bg-background pointer-events-none block size-[14px] rounded-full shadow-sm transition-transform',
                    checked ? 'translate-x-[14px]' : 'translate-x-[2px]',
                )}
            />
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/* Rows + lists                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The elevated settings-card surface. In dark mode it matches Linear's exact
 * settings-list tokens (background lch(7.67% .75 272), border lch(11.99% 1.83 272),
 * 11px radius); light mode falls back to the theme `card` token. Use this on ANY
 * wrapping card / list / panel in the settings pages so they all read identically.
 */
export const settingsSurface = 'border-border/70 bg-card rounded-[11px] border dark:border-[lch(11.99%_1.83_272)] dark:bg-[lch(7.67%_0.75_272)]';

/** The matching divider color for rows inside a settings surface. */
export const settingsDivider = 'border-border/70 dark:border-[lch(11.99%_1.83_272)]';

/** A bordered, rounded container that groups rows with dividers. */
export function SettingsList({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn(settingsSurface, 'overflow-hidden', className)}>{children}</div>;
}

/** A single row inside a SettingsList: leading icon, title/description, trailing control. */
export function SettingsRow({
    icon: Icon,
    iconNode,
    title,
    description,
    control,
    onClick,
    className,
}: {
    icon?: LucideIcon;
    iconNode?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    control?: ReactNode;
    onClick?: () => void;
    className?: string;
}) {
    const Wrapper = onClick ? 'button' : 'div';
    return (
        <Wrapper
            {...(onClick ? { type: 'button' as const, onClick } : {})}
            className={cn(
                settingsDivider,
                'flex min-h-[46px] w-full items-center gap-3 border-b px-4 py-2 text-left last:border-b-0',
                onClick && 'hover:bg-muted/40 transition-colors',
                className,
            )}
        >
            {iconNode}
            {Icon ? <Icon className="text-muted-foreground size-4 shrink-0" /> : null}
            <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium">{title}</div>
                {description ? <div className="text-muted-foreground mt-0.5 text-[12px] leading-4">{description}</div> : null}
            </div>
            {control ? <div className="flex shrink-0 items-center gap-2">{control}</div> : null}
        </Wrapper>
    );
}

/** A labelled toggle row (used heavily for notification / feature settings). */
export function ToggleRow({
    title,
    description,
    checked,
    onCheckedChange,
    disabled,
    icon,
    iconNode,
}: {
    title: ReactNode;
    description?: ReactNode;
    checked: boolean;
    onCheckedChange?: (v: boolean) => void;
    disabled?: boolean;
    icon?: LucideIcon;
    iconNode?: ReactNode;
}) {
    return (
        <SettingsRow
            icon={icon}
            iconNode={iconNode}
            title={title}
            description={description}
            control={<Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />}
        />
    );
}

/** A standalone label + control field (outside a list), stacked or inline. */
export function SettingsField({
    label,
    description,
    htmlFor,
    children,
    className,
}: {
    label?: ReactNode;
    description?: ReactNode;
    htmlFor?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('mb-5', className)}>
            {label ? (
                <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium">
                    {label}
                </label>
            ) : null}
            {description ? <p className="text-muted-foreground mb-2 text-[12px] leading-4">{description}</p> : null}
            {children}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Inputs                                                                     */
/* -------------------------------------------------------------------------- */

export function TextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={cn(
                'border-border focus:ring-ring h-8 w-full rounded-md border bg-transparent px-2.5 text-[13px] focus:ring-1 focus:outline-none',
                className,
            )}
            {...props}
        />
    );
}

/** Compact search input with a leading magnifier. */
export function SearchInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className={cn('relative', className)}>
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <input
                className="border-border focus:ring-ring h-8 w-full rounded-md border bg-transparent pr-2.5 pl-8 text-[13px] focus:ring-1 focus:outline-none"
                {...props}
            />
        </div>
    );
}

/** Thin wrapper around the shadcn Select for a label/value pair. */
export function SelectField({
    value,
    onValueChange,
    options,
    placeholder,
    className,
    triggerClassName,
}: {
    value?: string;
    onValueChange?: (v: string) => void;
    options: { value: string; label: ReactNode }[];
    placeholder?: string;
    className?: string;
    triggerClassName?: string;
}) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className={cn('h-8 w-full text-[13px]', triggerClassName)}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className={className}>
                {options.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-[13px]">
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

/* -------------------------------------------------------------------------- */
/* Plan gates / badges                                                        */
/* -------------------------------------------------------------------------- */

export type Plan = 'business' | 'enterprise' | 'plus';

export function PlanBadge({ plan, className }: { plan: Plan; className?: string }) {
    const { t } = useTranslation();
    const label =
        plan === 'enterprise'
            ? t('settingsCommon.plan.enterprise')
            : plan === 'plus'
              ? t('settingsCommon.plan.plus')
              : t('settingsCommon.plan.business');
    return (
        <Badge
            variant="outline"
            className={cn('border-border/80 text-muted-foreground h-5 rounded px-1.5 text-[10px] font-medium tracking-wide uppercase', className)}
        >
            {label}
        </Badge>
    );
}

/** A muted card that gates a feature behind a paid plan with a CTA. */
export function PlanGate({
    plan,
    title,
    description,
    cta,
    onAction,
    icon: Icon,
}: {
    plan: Plan;
    title?: ReactNode;
    description: ReactNode;
    cta?: ReactNode;
    onAction?: () => void;
    icon?: LucideIcon;
}) {
    const { t } = useTranslation();
    return (
        <div className={cn(settingsSurface, 'p-4')}>
            <div className="mb-2 flex items-center gap-2">
                {Icon ? <Icon className="text-muted-foreground size-4" /> : null}
                {title ? <h3 className="text-[13px] font-medium">{title}</h3> : null}
                <PlanBadge plan={plan} />
            </div>
            <p className="text-muted-foreground mb-3 max-w-lg text-[13px] leading-5">{description}</p>
            <Button size="sm" className="h-7 px-3 text-[13px]" onClick={onAction}>
                {cta ?? t('settingsCommon.startTrial')}
            </Button>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: {
    icon?: LucideIcon;
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'border-border/70 bg-card flex flex-col items-center justify-center rounded-[11px] border border-dashed px-6 py-10 text-center dark:border-[lch(11.99%_1.83_272)] dark:bg-[lch(7.67%_0.75_272)]',
                className,
            )}
        >
            {Icon ? <Icon className="text-muted-foreground/60 mb-3 size-6" /> : null}
            <p className="text-[13px] font-medium">{title}</p>
            {description ? <p className="text-muted-foreground mt-1 max-w-sm text-[12px] leading-4">{description}</p> : null}
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Row menu (⋯)                                                               */
/* -------------------------------------------------------------------------- */

export function RowMenu({
    items,
    label,
}: {
    label?: string;
    items: { label: ReactNode; onSelect?: () => void; destructive?: boolean; separatorBefore?: boolean }[];
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    aria-label={label ?? 'Menu'}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors"
                >
                    <MoreHorizontal className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
                {items.map((item, i) => (
                    <div key={i}>
                        {item.separatorBefore ? <DropdownMenuSeparator /> : null}
                        <DropdownMenuItem
                            onSelect={item.onSelect}
                            className={cn('text-[13px]', item.destructive && 'text-destructive focus:text-destructive')}
                        >
                            {item.label}
                        </DropdownMenuItem>
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/* -------------------------------------------------------------------------- */
/* FieldCard + FieldRow (label-left / control-right pattern)                  */
/* -------------------------------------------------------------------------- */

/**
 * A neutral card that wraps FieldRow children, matching the Linear profile page style.
 * Optional h2 title above the card.
 */
export function FieldCard({ title, children, className }: { title?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={cn('mb-8', className)}>
            {title ? <h2 className="mb-3 text-[15px] font-medium">{title}</h2> : null}
            {/* Elevated settings surface, shared with SettingsList. Rendered as a
                semantic list to match Linear's <ul><li> settings markup. */}
            <ul className={cn(settingsSurface, 'overflow-hidden')}>{children}</ul>
        </section>
    );
}

/**
 * A single row inside a FieldCard: label + optional description on the left,
 * control slot on the right. Matches the SettingRow style from preferences.tsx.
 */
export function FieldRow({
    label,
    description,
    htmlFor,
    children,
}: {
    label: ReactNode;
    description?: ReactNode;
    htmlFor?: string;
    children: ReactNode;
}) {
    return (
        <li
            className={cn(
                settingsDivider,
                'flex min-h-[60px] list-none flex-col items-stretch justify-between gap-3 border-b px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-6',
            )}
        >
            <div className="min-w-0">
                {htmlFor ? (
                    <label htmlFor={htmlFor} className="text-[13px] leading-5 font-medium">
                        {label}
                    </label>
                ) : (
                    <div className="text-[13px] leading-5 font-medium">{label}</div>
                )}
                {description ? <div className="text-muted-foreground mt-0.5 text-[12px] leading-4">{description}</div> : null}
            </div>
            <div className="w-full shrink-0 sm:w-auto">{children}</div>
        </li>
    );
}

/* -------------------------------------------------------------------------- */
/* Danger zone                                                                */
/* -------------------------------------------------------------------------- */

export function DangerZone({ title, children }: { title?: ReactNode; children: ReactNode }) {
    const { t } = useTranslation();
    return (
        <section className="border-destructive/30 mt-12 rounded-lg border">
            <h2 className="text-destructive border-destructive/30 border-b px-4 py-2.5 text-[13px] font-medium">
                {title ?? t('settingsCommon.dangerZone')}
            </h2>
            <div>{children}</div>
        </section>
    );
}

export function DangerRow({ title, description, action }: { title: ReactNode; description?: ReactNode; action: ReactNode }) {
    return (
        <div className="border-destructive/20 flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0">
            <div className="min-w-0">
                <div className="text-[13px] font-medium">{title}</div>
                {description ? <div className="text-muted-foreground mt-0.5 text-[12px] leading-4">{description}</div> : null}
            </div>
            <div className="shrink-0">{action}</div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Confirm dialog (for destructive actions)                                   */
/* -------------------------------------------------------------------------- */

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel,
    destructive = true,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    description?: ReactNode;
    confirmLabel?: ReactNode;
    cancelLabel?: ReactNode;
    destructive?: boolean;
    onConfirm: () => void;
}) {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-[15px]">{title}</DialogTitle>
                    {description ? <DialogDescription className="text-[13px]">{description}</DialogDescription> : null}
                </DialogHeader>
                <DialogFooter className="mt-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        {cancelLabel ?? t('settingsCommon.cancel')}
                    </Button>
                    <Button
                        variant={destructive ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                    >
                        {confirmLabel ?? t('settingsCommon.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/* Status pill (Enabled / Disabled / Off / Connected …)                       */
/* -------------------------------------------------------------------------- */

export function StatusPill({ on, onLabel, offLabel }: { on: boolean; onLabel?: ReactNode; offLabel?: ReactNode }) {
    const { t } = useTranslation();
    return (
        <span className={cn('inline-flex items-center gap-1.5 text-[12px]', on ? 'text-foreground' : 'text-muted-foreground')}>
            <span className={cn('size-1.5 rounded-full', on ? 'bg-emerald-500' : 'bg-muted-foreground/40')} />
            {on ? (onLabel ?? t('settingsCommon.enabled')) : (offLabel ?? t('settingsCommon.disabled'))}
        </span>
    );
}

/* Re-export Check so pages can build small custom controls without extra imports. */
export { Check };
