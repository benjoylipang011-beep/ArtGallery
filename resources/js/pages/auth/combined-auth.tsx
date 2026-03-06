import { useState, useEffect, useRef } from 'react';
import { Form, Head, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { store as loginStore } from '@/routes/login';
import { store as registerStore } from '@/routes/register';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

// ── Social icon data ──────────────────────────────────────────────────────────
const SOCIAL_ICONS = [
    {
        title: 'Google',
        path: 'M23.745 12.27c0-.79-.1-1.54-.257-2.26H12v4.26h6.52c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.08zM12 23.5c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 22.29 7.7 23.5 12 23.5zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 2.29 2.18 4.93l2.85 2.22c.87-2.6 3.3-4.53 6.16-4.53z',
    },
    {
        title: 'Facebook',
        path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    },
    {
        title: 'GitHub',
        path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
    },
    {
        title: 'LinkedIn',
        path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.047-8.733 0-9.637h3.554v1.366c.43-.664 1.199-1.608 2.928-1.608 2.136 0 3.745 1.393 3.745 4.385v5.494zM5.337 9.433c-1.144 0-1.915-.759-1.915-1.71 0-.951.767-1.71 1.906-1.71.948 0 1.915.759 1.915 1.71 0 .951-.767 1.71-1.906 1.71zm1.547 11.019H3.73V9.814h3.154v10.638zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    },
];

// ── Shared input class ────────────────────────────────────────────────────────
const inputCls = [
    'h-11 w-full rounded-lg',
    'border border-solid border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-400',
    'bg-white text-gray-900 placeholder:text-gray-400',
    'dark:bg-neutral-800 dark:text-white dark:border-neutral-600 dark:placeholder:text-neutral-500 dark:focus:border-neutral-400',
    '[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#ffffff]',
    '[&:-webkit-autofill]:[-webkit-text-fill-color:#111827]',
    '[&:-webkit-autofill:hover]:shadow-[inset_0_0_0_1000px_#ffffff]',
    '[&:-webkit-autofill:focus]:shadow-[inset_0_0_0_1000px_#ffffff]',
    '[&::-ms-reveal]:hidden [&::-ms-clear]:hidden',
    '[&::-webkit-contacts-auto-fill-button]:hidden',
    '[&::-webkit-credentials-auto-fill-button]:hidden',
].join(' ');

// ── Eye icon SVGs ─────────────────────────────────────────────────────────────
function EyeOpen() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
}
function EyeOff() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    );
}

// ── Password input with eye toggle ────────────────────────────────────────────
function PasswordInput({ id, name, placeholder, autoComplete }: {
    id: string;
    name: string;
    placeholder: string;
    autoComplete: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Input
                id={id}
                type={show ? 'text' : 'password'}
                name={name}
                required
                autoComplete={autoComplete}
                placeholder={placeholder}
                className={`${inputCls} pr-10`}
            />
            <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                tabIndex={-1}
                aria-label={show ? 'Hide password' : 'Show password'}
            >
                {show ? <EyeOff /> : <EyeOpen />}
            </button>
        </div>
    );
}

function SocialIcons() {
    return (
        <div className="flex justify-center gap-3">
            {SOCIAL_ICONS.map(({ title, path }) => (
                <div key={title} className="group relative">
                    <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-300 text-gray-600 transition-colors hover:border-teal-700 hover:text-teal-700 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-teal-400 dark:hover:text-teal-400"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                            <path d={path} />
                        </svg>
                    </button>
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
                        {title}
                        {/* Arrow */}
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Mobile teal CTA banner ────────────────────────────────────────────────────
function MobileTealBanner({ title, subtitle, buttonLabel, onClick }: {
    title: string;
    subtitle: string;
    buttonLabel: string;
    onClick: () => void;
}) {
    return (
        <div className="px-3 pt-3 pb-0">
            <div
                className="relative overflow-hidden flex flex-col items-center justify-center gap-4 px-6 py-10 text-center rounded-3xl"
                style={{ background: 'linear-gradient(145deg, #0d4a47 0%, #0f766e 55%, #115e59 100%)' }}
            >
                <div className="absolute rounded-full bg-white/10" style={{ width: 150, height: 150, bottom: -40, right: -40 }} />
                <div className="absolute rounded-full bg-white/[0.07]" style={{ width: 100, height: 100, top: -30, left: -30 }} />
                {/* ── Logo placeholder — swap src when ready ── */}
                <img
                    src="/Gemini_Generated_Image_d9cjlzd9cjlzd9cj-removebg-preview.png"
                    alt="Logo"
                    className="relative h-14 w-14 rounded-2xl object-contain shadow-lg"
                    onError={e => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                />
                <h2 className="relative text-2xl font-extrabold text-white">{title}</h2>
                <p className="relative text-sm leading-relaxed text-teal-200">{subtitle}</p>
                <button
                    type="button"
                    onClick={onClick}
                    className="relative mt-1 rounded-full border-2 border-white px-8 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-teal-800"
                >
                    {buttonLabel}
                </button>
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CombinedAuth({ status, canResetPassword, canRegister }: Props) {
    const { url } = usePage();
    const [isLogin, setIsLogin] = useState(!url.includes('/register'));
    const [mounted, setMounted] = useState(false);
    const [mobileHeight, setMobileHeight] = useState<number | undefined>(undefined);
    const panel1Ref = useRef<HTMLDivElement>(null);
    const panel2Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 30);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const updateHeight = () => {
            const activePanel = isLogin ? panel1Ref.current : panel2Ref.current;
            if (activePanel) setMobileHeight(activePanel.offsetHeight);
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, [isLogin]);

    return (
        <>
            <Head title={isLogin ? 'Log in' : 'Register'} />

            {/* Full-page gradient background */}
            <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-yellow-600 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 px-4 py-8"
                style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'scale(1)' : 'scale(1.02)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                }}
            >

                {/* ── Outer card: max-w-4xl matches Image 1's wider proportions ── */}
                <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-neutral-900 dark:shadow-black/50">

                    {/* ══════════════════════════════════════════════
                        MOBILE LAYOUT  (hidden on md+)
                        200%-wide track; translateX slides panels.
                    ══════════════════════════════════════════════ */}
                    <div className="md:hidden overflow-hidden" style={{ height: mobileHeight, transition: 'height 0.7s ease-in-out' }}>
                        <div
                            className="flex items-start transition-transform duration-700 ease-in-out will-change-transform"
                            style={{
                                width: '200%',
                                transform: isLogin ? 'translateX(0%)' : 'translateX(-50%)',
                            }}
                        >
                            {/* Mobile Panel 1 — Sign In */}
                            <div ref={panel1Ref} className="flex flex-col" style={{ width: '50%' }}>
                                <MobileTealBanner
                                    title="New Here?"
                                    subtitle="Sign up and discover a great amount of new opportunities!"
                                    buttonLabel="SIGN UP"
                                    onClick={() => setIsLogin(false)}
                                />
                                <div className="px-6 pt-6 pb-3">
                                    <h2 className="mb-5 text-center text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                        Sign In
                                    </h2>
                                    <SocialIcons />
                                    <p className="my-4 text-center text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                                        or use your account
                                    </p>
                                    <Form
                                        {...loginStore.form()}
                                        resetOnSuccess={['password']}
                                        className="space-y-3"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <div>
                                                    <Input id="m-login-email" type="email" name="email" required
                                                        autoComplete="email" placeholder="Email Address"
                                                        className={inputCls} />
                                                    <InputError message={errors.email} className="mt-1 text-xs" />
                                                </div>
                                                <div>
                                                    <PasswordInput id="m-login-password" name="password"
                                                        placeholder="Password" autoComplete="current-password" />
                                                    <InputError message={errors.password} className="mt-1 text-xs" />
                                                </div>
                                                <div className="flex items-center justify-between pt-1">
                                                    <label className="flex cursor-pointer items-center gap-2">
                                                        <Checkbox id="m-remember" name="remember" />
                                                        <span className="text-xs text-gray-600 dark:text-neutral-400">Remember me</span>
                                                    </label>
                                                    {canResetPassword && (
                                                        <TextLink href={request()} className="text-xs text-teal-700 hover:underline">
                                                            Forgot password?
                                                        </TextLink>
                                                    )}
                                                </div>
                                                <Button type="submit"
                                                    className="h-11 w-full rounded-full bg-yellow-400 font-bold text-gray-900 hover:bg-yellow-500 active:bg-yellow-600"
                                                    disabled={processing}>
                                                    {processing && <Spinner />} SIGN IN
                                                </Button>
                                            </>
                                        )}
                                    </Form>
                                </div>
                            </div>

                            {/* Mobile Panel 2 — Register */}
                            <div ref={panel2Ref} className="flex flex-col" style={{ width: '50%' }}>
                                <MobileTealBanner
                                    title="Already have an account?"
                                    subtitle="Sign in and pick up right where you left off!"
                                    buttonLabel="SIGN IN"
                                    onClick={() => setIsLogin(true)}
                                />
                                <div className="px-6 pt-6 pb-6">
                                    <h2 className="mb-4 text-center text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                        Create Account
                                    </h2>
                                    <SocialIcons />
                                    <div className="my-4 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-gray-200 dark:bg-neutral-700" />
                                        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500">OR</span>
                                        <div className="h-px flex-1 bg-gray-200 dark:bg-neutral-700" />
                                    </div>
                                    <Form
                                        {...registerStore.form()}
                                        resetOnSuccess={['password', 'password_confirmation']}
                                        className="space-y-3"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <div>
                                                    <Input id="m-reg-name" type="text" name="name" required
                                                        autoComplete="name" placeholder="Full Name"
                                                        className={inputCls} />
                                                    <InputError message={errors.name} className="mt-1 text-xs" />
                                                </div>
                                                <div>
                                                    <Input id="m-reg-email" type="email" name="email" required
                                                        autoComplete="email" placeholder="Email Address"
                                                        className={inputCls} />
                                                    <InputError message={errors.email} className="mt-1 text-xs" />
                                                </div>
                                                <div>
                                                    <PasswordInput id="m-reg-password" name="password"
                                                        placeholder="Password" autoComplete="new-password" />
                                                    <InputError message={errors.password} className="mt-1 text-xs" />
                                                </div>
                                                <div>
                                                    <PasswordInput id="m-reg-confirm" name="password_confirmation"
                                                        placeholder="Confirm Password" autoComplete="new-password" />
                                                    <InputError message={errors.password_confirmation} className="mt-1 text-xs" />
                                                </div>
                                                <Button type="submit"
                                                    className="h-11 w-full rounded-full bg-yellow-400 font-bold text-gray-900 hover:bg-yellow-500 active:bg-yellow-600"
                                                    disabled={processing}>
                                                    {processing && <Spinner />} SIGN UP
                                                </Button>
                                            </>
                                        )}
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════
                        DESKTOP LAYOUT  (hidden below md)
                        Two-column grid + absolute sliding teal panel.
                        min-h-[580px] matches the taller Image 1 proportions.
                    ══════════════════════════════════════════════ */}
                    <div className="hidden md:block">
                        <div className="grid min-h-[580px] grid-cols-2">

                            {/* LEFT — Sign In form */}
                            <div className="relative flex flex-col justify-center px-12 py-14">
                                <div className={`transition-all duration-500 ${
                                    isLogin
                                        ? 'pointer-events-auto translate-x-0 opacity-100 delay-300'
                                        : 'pointer-events-none translate-x-6 opacity-0'
                                }`}>
                                    <h2 className="mb-1 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Sign In</h2>
                                    <p className="mb-5 text-sm text-gray-500 dark:text-neutral-400">Welcome back! Enter your credentials to continue.</p>

                                    <SocialIcons />

                                    <p className="my-4 text-center text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                                        or use your account
                                    </p>

                                    <Form {...loginStore.form()} resetOnSuccess={['password']} className="space-y-3">
                                        {({ processing, errors }) => (
                                            <>
                                                <div>
                                                    <Input id="login-email" type="email" name="email" required
                                                        autoFocus={isLogin} autoComplete="email" placeholder="Email Address"
                                                        className={inputCls} />
                                                    <InputError message={errors.email} className="mt-1 text-xs" />
                                                </div>
                                                <div>
                                                    <PasswordInput id="login-password" name="password"
                                                        placeholder="Password" autoComplete="current-password" />
                                                    <InputError message={errors.password} className="mt-1 text-xs" />
                                                </div>
                                                <div className="flex items-center justify-between pt-1">
                                                    <label className="flex cursor-pointer items-center gap-2">
                                                        <Checkbox id="remember" name="remember" />
                                                        <span className="text-xs text-gray-600 dark:text-neutral-400">Remember me</span>
                                                    </label>
                                                    {canResetPassword && (
                                                        <TextLink href={request()} className="text-xs text-teal-700 hover:underline">
                                                            Forgot password?
                                                        </TextLink>
                                                    )}
                                                </div>
                                                <Button type="submit"
                                                    className="h-11 w-full rounded-full bg-yellow-400 font-bold text-gray-900 hover:bg-yellow-500 active:bg-yellow-600"
                                                    disabled={processing}>
                                                    {processing && <Spinner />} SIGN IN →
                                                </Button>
                                            </>
                                        )}
                                    </Form>
                                </div>
                            </div>

                            {/* RIGHT — Register form */}
                            <div className="relative flex flex-col justify-center px-12 py-14">
                                {canRegister && (
                                    <div className={`transition-all duration-500 ${
                                        !isLogin
                                            ? 'pointer-events-auto translate-x-0 opacity-100 delay-300'
                                            : 'pointer-events-none -translate-x-6 opacity-0'
                                    }`}>
                                        <h2 className="mb-1 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Create Account</h2>
                                        <p className="mb-5 text-sm text-gray-500 dark:text-neutral-400">Fill in your details to get started.</p>

                                        <SocialIcons />

                                        <div className="my-4 flex items-center gap-3">
                                            <div className="h-px flex-1 bg-gray-200 dark:bg-neutral-700" />
                                            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500">OR</span>
                                            <div className="h-px flex-1 bg-gray-200 dark:bg-neutral-700" />
                                        </div>

                                        <Form {...registerStore.form()} resetOnSuccess={['password', 'password_confirmation']} className="space-y-3">
                                            {({ processing, errors }) => (
                                                <>
                                                    <div>
                                                        <Input id="register-name" type="text" name="name" required
                                                            autoComplete="name" placeholder="Full Name"
                                                            className={inputCls} />
                                                        <InputError message={errors.name} className="mt-1 text-xs" />
                                                    </div>
                                                    <div>
                                                        <Input id="register-email" type="email" name="email" required
                                                            autoComplete="email" placeholder="Email Address"
                                                            className={inputCls} />
                                                        <InputError message={errors.email} className="mt-1 text-xs" />
                                                    </div>
                                                    <div>
                                                        <PasswordInput id="register-password" name="password"
                                                            placeholder="Password" autoComplete="new-password" />
                                                        <InputError message={errors.password} className="mt-1 text-xs" />
                                                    </div>
                                                    <div>
                                                        <PasswordInput id="register-confirm" name="password_confirmation"
                                                            placeholder="Confirm Password" autoComplete="new-password" />
                                                        <InputError message={errors.password_confirmation} className="mt-1 text-xs" />
                                                    </div>
                                                    <Button type="submit"
                                                        className="h-11 w-full rounded-full bg-yellow-400 font-bold text-gray-900 hover:bg-yellow-500 active:bg-yellow-600"
                                                        disabled={processing}>
                                                        {processing && <Spinner />} SIGN UP →
                                                    </Button>
                                                </>
                                            )}
                                        </Form>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Sliding teal overlay ── */}
                        <div
                            className="absolute inset-y-0 w-1/2 transition-all duration-700 ease-in-out"
                            style={{
                                left: isLogin ? '50%' : '0%',
                                background: 'linear-gradient(145deg, #0d4a47 0%, #0f766e 55%, #115e59 100%)',
                                borderRadius: isLogin
                                    ? '2.5rem 1.5rem 1.5rem 2.5rem'
                                    : '1.5rem 2.5rem 2.5rem 1.5rem',
                            }}
                        >
                            <div className="absolute rounded-full bg-white/10" style={{ width: 220, height: 220, bottom: -60, right: -60 }} />
                            <div className="absolute rounded-full bg-white/[0.06]" style={{ width: 140, height: 140, top: -40, left: -40 }} />

                            <div className="flex h-full flex-col items-center justify-center gap-6 px-12 text-center">
                                {isLogin ? (
                                    <>
                                        <img
                                            src="/Gemini_Generated_Image_d9cjlzd9cjlzd9cj-removebg-preview.png"
                                            alt="Logo"
                                            className="h-16 w-16 rounded-2xl object-contain shadow-lg"
                                            onError={e => {
                                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                        <h2 className="text-3xl font-extrabold text-white">New Here?</h2>
                                        <p className="text-sm leading-relaxed text-teal-200">
                                            Sign up and discover<br />a great amount of new opportunities!
                                        </p>
                                        <button type="button" onClick={() => setIsLogin(false)}
                                            className="mt-1 rounded-full border-2 border-white px-10 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-teal-800">
                                            SIGN UP
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <img
                                            src="/Gemini_Generated_Image_d9cjlzd9cjlzd9cj-removebg-preview.png"
                                            alt="Logo"
                                            className="h-16 w-16 rounded-2xl object-contain shadow-lg"
                                            onError={e => {
                                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                        <h2 className="text-3xl font-extrabold text-white">Welcome Back!</h2>
                                        <p className="text-sm leading-relaxed text-teal-200">
                                            Provide your personal details<br />to use all features
                                        </p>
                                        <button type="button" onClick={() => setIsLogin(true)}
                                            className="mt-1 rounded-full border-2 border-white px-10 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-teal-800">
                                            SIGN IN
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}