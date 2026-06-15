import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

/* Approximation of the Linear mark: white disc crossed by diagonal strokes. */
function LinearMark() {
    return (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
            <defs>
                <clipPath id="mark-clip">
                    <circle cx="20" cy="20" r="20" />
                </clipPath>
            </defs>
            <circle cx="20" cy="20" r="20" fill="#E8E8E8" />
            <g clipPath="url(#mark-clip)" stroke="#0A0A0A" strokeWidth="3.2">
                <line x1="-6" y1="14" x2="22" y2="-14" />
                <line x1="-4" y1="22" x2="26" y2="-8" />
                <line x1="-2" y1="30" x2="30" y2="-2" />
            </g>
        </svg>
    );
}

function PillButton({ children, primary, className, ...props }: React.ComponentPropsWithoutRef<'button'> & { primary?: boolean }) {
    return (
        <button
            {...props}
            className={cn(
                'flex h-11 w-72 items-center justify-center rounded-full text-[13px] font-medium transition-colors duration-150',
                primary ? 'bg-[#5E69D1] text-white hover:bg-[#6B75DA]' : 'bg-[#1C1C1D] text-[#E2E3E5] hover:bg-[#252527]',
                'disabled:pointer-events-none disabled:opacity-60',
                className,
            )}
        >
            {children}
        </button>
    );
}

function PillInput(props: React.ComponentPropsWithoutRef<'input'>) {
    return (
        <input
            {...props}
            className={cn(
                'h-11 w-72 rounded-lg border border-[#2A2A2B] bg-[#141415] px-4 text-center text-[13px] text-[#E2E3E5]',
                'placeholder:text-[#62666D] focus:border-[#5E69D1] focus:ring-1 focus:ring-[#5E69D1] focus:outline-none',
                'transition-colors duration-150',
            )}
        />
    );
}

interface AuthForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    remember: boolean;
    [key: string]: string | boolean;
}

export function LinearAuthPage({ mode }: { mode: 'login' | 'register' }) {
    const [step, setStep] = useState<'methods' | 'email'>('methods');
    const isLogin = mode === 'login';

    const { data, setData, post, processing, errors, reset, transform } = useForm<AuthForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        remember: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isLogin) {
            post(route('login'), {
                onSuccess: () => toast.success({ title: 'Logged in' }),
                onError: () => toast.error({ title: 'Login failed' }),
                onFinish: () => reset('password'),
            });
        } else {
            // The single password field doubles as its own confirmation.
            transform((form) => ({ ...form, password_confirmation: form.password }));
            post(route('register'), {
                onSuccess: () => toast.success({ title: 'Account created' }),
                onError: () => toast.error({ title: 'Signup failed' }),
                onFinish: () => reset('password', 'password_confirmation'),
            });
        }
    };

    const title = isLogin ? 'Log in to Linear' : 'Create your account';
    const firstError = errors.email ?? errors.password ?? errors.name;

    return (
        <div
            className="flex min-h-svh flex-col items-center justify-center bg-[#090909] px-4"
            style={{ backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,120,135,0.08), transparent)' }}
        >
            <Head title={title} />

            <LinearMark />
            <h1 className="mt-9 text-lg font-medium text-[#E2E3E5]">{title}</h1>

            {step === 'methods' ? (
                <div key="methods" className="animate-in fade-in zoom-in-95 mt-9 flex flex-col gap-4 duration-200">
                    <a href="/auth/google/redirect" className="contents">
                        <PillButton primary type="button" tabIndex={-1}>
                            Continue with Google
                        </PillButton>
                    </a>
                    <a href="/auth/github/redirect" className="contents">
                        <PillButton type="button" tabIndex={-1}>
                            Continue with GitHub
                        </PillButton>
                    </a>
                    <PillButton type="button" onClick={() => setStep('email')}>
                        Continue with email
                    </PillButton>
                    <PillButton
                        type="button"
                        disabled={processing}
                        onClick={() =>
                            router.post(
                                '/auth/mock',
                                {},
                                {
                                    onSuccess: () => toast.success({ title: 'Demo account ready' }),
                                    onError: () => toast.error({ title: 'Demo login failed' }),
                                },
                            )
                        }
                    >
                        Continue with demo account
                    </PillButton>
                    {firstError && <p className="w-72 text-center text-xs text-red-400">{firstError}</p>}
                </div>
            ) : (
                <form key="email" onSubmit={submit} className="animate-in fade-in zoom-in-95 mt-9 flex flex-col gap-4 duration-200">
                    {!isLogin && (
                        <PillInput
                            autoFocus
                            placeholder="Your name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            autoComplete="name"
                            required
                        />
                    )}
                    <PillInput
                        autoFocus={isLogin}
                        type="email"
                        placeholder="Enter your email address…"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="email"
                        required
                    />
                    <PillInput
                        type="password"
                        placeholder={isLogin ? 'Enter your password…' : 'Choose a password…'}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                        required
                    />
                    <PillButton primary type="submit" disabled={processing}>
                        {processing && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                        {isLogin ? 'Log in' : 'Sign up'}
                    </PillButton>
                    {firstError && <p className="w-72 text-center text-xs text-red-400">{firstError}</p>}
                    <button
                        type="button"
                        onClick={() => setStep('methods')}
                        className="text-center text-[13px] text-[#8A8F98] transition-colors duration-100 hover:text-[#E2E3E5]"
                    >
                        Back to {isLogin ? 'login' : 'signup'}
                    </button>
                </form>
            )}

            <p className="mt-10 text-[13px] text-[#62666D]">
                {isLogin ? (
                    <>
                        Don&rsquo;t have an account?{' '}
                        <Link href={route('register')} className="text-[#E2E3E5] hover:underline">
                            Sign up
                        </Link>{' '}
                        <span>or</span>{' '}
                        <a href="https://linear.app/homepage" className="text-[#E2E3E5] hover:underline">
                            learn more
                        </a>
                    </>
                ) : (
                    <>
                        Already have an account?{' '}
                        <Link href={route('login')} className="text-[#E2E3E5] hover:underline">
                            Log in
                        </Link>
                    </>
                )}
            </p>
        </div>
    );
}
