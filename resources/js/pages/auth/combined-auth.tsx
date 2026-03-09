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
import { request, email as passwordEmail } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ message, index, onClose }: { message: string; index: number; onClose: () => void }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const raf = requestAnimationFrame(() => setVisible(true));
        const auto = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 400);
        }, 4000);
        return () => { cancelAnimationFrame(raf); clearTimeout(auto); };
    }, []);

    const dismiss = () => { setVisible(false); setTimeout(onClose, 400); };

    return (
        <div
            style={{
                position: 'fixed',
                top: 24 + index * 88,
                right: 24,
                zIndex: 9999,
                minWidth: 300,
                maxWidth: 380,
                transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 40px))',
                opacity: visible ? 1 : 0,
                transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
            }}
        >
            <div className="relative flex items-start gap-3 overflow-hidden rounded-2xl border border-red-200 bg-white px-4 py-3.5 shadow-2xl dark:border-red-800/40 dark:bg-neutral-900">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-red-500 dark:fill-red-400">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="flex-1 pt-0.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Registration failed</p>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-neutral-400">{message}</p>
                </div>
                <button
                    type="button"
                    onClick={dismiss}
                    className="shrink-0 text-gray-400 transition-colors hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                    aria-label="Dismiss"
                >
                    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                </button>
                <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-2xl bg-red-100 dark:bg-red-900/30">
                    <div
                        className="h-full bg-red-400 dark:bg-red-500"
                        style={{
                            width: visible ? '0%' : '100%',
                            transition: visible ? 'width 4s linear' : 'none',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

function ToastList({ toasts, onDismiss }: {
    toasts: { id: number; message: string }[];
    onDismiss: (id: number) => void;
}) {
    return (
        <>
            {toasts.map((t, i) => (
                <Toast key={t.id} message={t.message} index={i} onClose={() => onDismiss(t.id)} />
            ))}
        </>
    );
}


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

// ── Validation helpers ────────────────────────────────────────────────────────
// Blocks emojis and special characters — letters, spaces, hyphens, apostrophes only
const EMOJI_REGEX = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FEFF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA9F}]/u;
const SPECIAL_CHAR_NAME_REGEX = /[^a-zA-Z\s'\-\.]/;

function sanitizeName(value: string): string {
    // Strip emojis and special characters, keep letters/spaces/hyphens/apostrophes/dots
    return value.replace(new RegExp(EMOJI_REGEX.source, 'gu'), '').replace(SPECIAL_CHAR_NAME_REGEX, (char) => {
        // Replace disallowed char silently
        return '';
    });
}

// Password: must be 6+ chars, at least 1 letter and 1 number, no emojis
function validatePassword(value: string): { valid: boolean; strength: number; hint: string } {
    if (value.length === 0) return { valid: false, strength: 0, hint: '' };
    if (EMOJI_REGEX.test(value)) return { valid: false, strength: 0, hint: 'Emojis are not allowed' };
    if (value.length < 6) return { valid: false, strength: 1, hint: 'At least 6 characters required' };
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    if (!hasLetter) return { valid: false, strength: 2, hint: 'Must include at least one letter' };
    if (!hasNumber) return { valid: false, strength: 2, hint: 'Must include at least one number' };
    // Strength scoring
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[^a-zA-Z0-9]/.test(value);
    const long = value.length >= 10;
    const score = [hasLetter, hasNumber, hasUpper && hasLower, hasSpecial, long].filter(Boolean).length;
    const hints = ['Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
    return { valid: true, strength: score, hint: hints[Math.min(score - 1, 4)] };
}

// ── Name input with validation ─────────────────────────────────────────────────
function NameInput({ id, name, placeholder }: { id: string; name: string; placeholder: string }) {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (EMOJI_REGEX.test(raw)) {
            setError('Emojis are not allowed');
            e.target.value = sanitizeName(raw);
            setValue(e.target.value);
            return;
        }
        if (SPECIAL_CHAR_NAME_REGEX.test(raw)) {
            setError('Special characters are not allowed');
            e.target.value = sanitizeName(raw);
            setValue(e.target.value);
            return;
        }
        setError('');
        setValue(raw);
    };

    return (
        <div>
            <Input
                id={id}
                type="text"
                name={name}
                required
                autoComplete="name"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                className={inputCls}
            />
            {error && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current shrink-0"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 6.5a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75z"/></svg>
                    {error}
                </p>
            )}
        </div>
    );
}

// ── Password input with eye toggle + strength ─────────────────────────────────
function PasswordInput({ id, name, placeholder, autoComplete, showStrength = false }: {
    id: string;
    name: string;
    placeholder: string;
    autoComplete: string;
    showStrength?: boolean;
}) {
    const [show, setShow] = useState(false);
    const [value, setValue] = useState('');
    const [touched, setTouched] = useState(false);
    const validation = validatePassword(value);

    const strengthColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-teal-400', 'bg-green-500'];
    const strengthTextColors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-teal-600', 'text-green-600'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        // Strip emojis silently
        if (EMOJI_REGEX.test(raw)) {
            const cleaned = raw.replace(new RegExp(EMOJI_REGEX.source, 'gu'), '');
            e.target.value = cleaned;
            setValue(cleaned);
            return;
        }
        setValue(raw);
    };

    const showError = touched && value.length > 0 && !validation.valid;

    return (
        <div>
            <div className="relative">
                <Input
                    id={id}
                    type={show ? 'text' : 'password'}
                    name={name}
                    required
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    onBlur={() => setTouched(true)}
                    className={`${inputCls} pr-10 ${showError ? 'border-red-400 dark:border-red-500' : ''}`}
                />
                <button
                    type="button"
                    onClick={() => setShow(v => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors"
                    tabIndex={-1}
                    aria-label={show ? 'Hide password' : 'Show password'}
                >
                    {show ? <EyeOff /> : <EyeOpen />}
                </button>
            </div>

            {/* Strength bar — only on the main password field */}
            {showStrength && value.length > 0 && (
                <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                    i <= validation.strength ? strengthColors[validation.strength] : 'bg-gray-200 dark:bg-neutral-700'
                                }`}
                            />
                        ))}
                    </div>
                    <p className={`text-xs font-medium ${strengthTextColors[validation.strength]}`}>
                        {validation.hint}
                    </p>
                </div>
            )}

            {/* Inline error when not showing strength bar */}
            {!showStrength && showError && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current shrink-0"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 6.5a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75z"/></svg>
                    {validation.hint}
                </p>
            )}
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
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [mobileHeight, setMobileHeight] = useState<number | undefined>(undefined);
    const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
    const showToast = (message: string) => setToasts(prev => [...prev, { id: Date.now(), message }]);
    const dismissToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));
    const panel1Ref = useRef<HTMLDivElement>(null);
    const panel2Ref = useRef<HTMLDivElement>(null);
    const panel3Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 30);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('dark'));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const updateHeight = () => {
            const activePanel = isForgotPassword ? panel3Ref.current : isLogin ? panel1Ref.current : panel2Ref.current;
            if (activePanel) setMobileHeight(activePanel.offsetHeight);
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, [isLogin, isForgotPassword]);

    return (
        <>
            <Head title={isForgotPassword ? 'Forgot Password' : isLogin ? 'Log in' : 'Register'} />
            <ToastList toasts={toasts} onDismiss={dismissToast} />

            {/* Full-page gradient background — light: blue-to-gold | dark: deep navy */}
            <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8"
                style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #0f172a 0%, #1a2744 50%, #0f2027 100%)'
                        : 'linear-gradient(135deg, #417bb5 0%, #b0974b 100%)',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'scale(1)' : 'scale(1.02)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease, background 0.6s ease',
                }}
            >
                {/* Grid lines overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: isDark
                        ? 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)'
                        : 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: isDark ? 0.2 : 0.3,
                    pointerEvents: 'none',
                    transition: 'opacity 0.6s ease',
                }} />
                {/* Floating gradient balls */}
                <div style={{
                    position: 'absolute', top: -100, right: -50,
                    width: 250, height: 250, borderRadius: '50%',
                    background: isDark ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    filter: 'blur(60px)', opacity: isDark ? 0.2 : 0.4,
                    animation: 'authFloat 25s infinite ease-in-out', pointerEvents: 'none', transition: 'opacity 0.6s ease',
                }} />
                <div style={{
                    position: 'absolute', bottom: -100, left: -50,
                    width: 200, height: 200, borderRadius: '50%',
                    background: isDark ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                    filter: 'blur(60px)', opacity: isDark ? 0.2 : 0.4,
                    animation: 'authFloat 30s infinite ease-in-out reverse', pointerEvents: 'none', transition: 'opacity 0.6s ease',
                }} />
                <div style={{
                    position: 'absolute', top: '40%', left: '5%',
                    width: 150, height: 150, borderRadius: '50%',
                    background: isDark ? 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)' : 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
                    filter: 'blur(60px)', opacity: isDark ? 0.25 : 0.4,
                    animation: 'authFloat 20s infinite ease-in-out', pointerEvents: 'none', transition: 'opacity 0.6s ease',
                }} />
                <style>{`
                    @keyframes authFloat {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(20px, -30px) rotate(120deg); }
                        66% { transform: translate(-15px, 15px) rotate(240deg); }
                    }
                `}</style>

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
                                width: '300%',
                                transform: isForgotPassword
                                    ? 'translateX(-66.666%)'
                                    : isLogin
                                        ? 'translateX(0%)'
                                        : 'translateX(-33.333%)',
                            }}
                        >
                            {/* Mobile Panel 1 — Sign In */}
                            <div ref={panel1Ref} className="flex flex-col" style={{ width: '33.333%' }}>
                                <MobileTealBanner
                                    title="New Here?"
                                    subtitle="Sign up and discover a great amount of new opportunities!"
                                    buttonLabel="SIGN UP"
                                    onClick={() => { setIsLogin(false); setIsForgotPassword(false); }}
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
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsForgotPassword(true)}
                                                            className="text-xs text-teal-700 hover:underline"
                                                        >
                                                            Forgot password?
                                                        </button>
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
                            <div ref={panel2Ref} className="flex flex-col" style={{ width: '33.333%' }}>
                                <MobileTealBanner
                                    title="Already have an account?"
                                    subtitle="Sign in and pick up right where you left off!"
                                    buttonLabel="SIGN IN"
                                    onClick={() => { setIsLogin(true); setIsForgotPassword(false); }}
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
                                        onError={(errors) => {
                                            if (errors.email) showToast(errors.email);
                                            if (errors.name) showToast(errors.name);
                                        }}
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <div>
                                                    <NameInput id="m-reg-name" name="name" placeholder="Full Name" />
                                                </div>
                                                <div>
                                                    <Input id="m-reg-email" type="email" name="email" required
                                                        autoComplete="email" placeholder="Email Address"
                                                        className={`${inputCls} ${errors.email ? 'border-red-400 dark:border-red-500' : ''}`} />
                                                </div>
                                                <div>
                                                    <PasswordInput id="m-reg-password" name="password"
                                                        placeholder="Password (6+ chars, letters & numbers)" autoComplete="new-password" showStrength />
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

                            {/* Mobile Panel 3 — Forgot Password */}
                            <div ref={panel3Ref} className="flex flex-col" style={{ width: '33.333%' }}>
                                <div
                                    className="relative overflow-hidden flex flex-col items-center justify-center gap-4 px-6 py-10 text-center mx-3 mt-3 rounded-3xl"
                                    style={{ background: 'linear-gradient(145deg, #0d4a47 0%, #0f766e 55%, #115e59 100%)' }}
                                >
                                    <div className="absolute rounded-full bg-white/10" style={{ width: 150, height: 150, bottom: -40, right: -40 }} />
                                    <div className="absolute rounded-full bg-white/[0.07]" style={{ width: 100, height: 100, top: -30, left: -30 }} />
                                    <img
                                        src="/Gemini_Generated_Image_d9cjlzd9cjlzd9cj-removebg-preview.png"
                                        alt="Logo"
                                        className="relative h-14 w-14 rounded-2xl object-contain shadow-lg"
                                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                    />
                                    <h2 className="relative text-2xl font-extrabold text-white">Forgot Password?</h2>
                                    <p className="relative text-sm leading-relaxed text-teal-200">Enter your email and we'll send you a reset link</p>
                                </div>
                                <div className="px-6 pt-6 pb-6">
                                    {status && (
                                        <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            {status}
                                        </div>
                                    )}
                                    <Form {...passwordEmail.form()} className="space-y-4">
                                        {({ processing, errors }) => (
                                            <>
                                                <div>
                                                    <Input
                                                        id="fp-email"
                                                        type="email"
                                                        name="email"
                                                        required
                                                        autoComplete="email"
                                                        placeholder="Email Address"
                                                        className={inputCls}
                                                    />
                                                    <InputError message={errors.email} className="mt-1 text-xs" />
                                                </div>
                                                <Button type="submit"
                                                    className="h-11 w-full rounded-full bg-yellow-400 font-bold text-gray-900 hover:bg-yellow-500 active:bg-yellow-600"
                                                    disabled={processing}>
                                                    {processing && <Spinner />} SEND RESET LINK
                                                </Button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsForgotPassword(false); setIsLogin(true); }}
                                                    className="w-full text-center text-sm text-teal-700 hover:underline dark:text-teal-400"
                                                >
                                                    ← Back to Sign In
                                                </button>
                                            </>
                                        )}
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>

                  
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
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsForgotPassword(true)}
                                                            className="text-xs text-teal-700 hover:underline"
                                                        >
                                                            Forgot password?
                                                        </button>
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

                                        <Form
                                            {...registerStore.form()}
                                            resetOnSuccess={['password', 'password_confirmation']}
                                            className="space-y-3"
                                            onError={(errors) => {
                                                if (errors.email) showToast(errors.email);
                                                if (errors.name) showToast(errors.name);
                                            }}
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <div>
                                                        <NameInput id="register-name" name="name" placeholder="Full Name" />
                                                    </div>
                                                    <div>
                                                        <Input id="register-email" type="email" name="email" required
                                                            autoComplete="email" placeholder="Email Address"
                                                            className={`${inputCls} ${errors.email ? 'border-red-400 dark:border-red-500' : ''}`} />
                                                    </div>
                                                    <div>
                                                        <PasswordInput id="register-password" name="password"
                                                            placeholder="Password (6+ chars, letters & numbers)" autoComplete="new-password" showStrength />
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
                                opacity: isForgotPassword ? 0 : 1,
                                pointerEvents: isForgotPassword ? 'none' : 'auto',
                                transition: 'left 0.7s ease-in-out, opacity 0.3s ease',
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

                        {/* ── Forgot Password overlay (desktop) — slides in over full card ── */}
                        <div
                            className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out"
                            style={{
                                background: 'linear-gradient(145deg, #0d4a47 0%, #0f766e 55%, #115e59 100%)',
                                opacity: isForgotPassword ? 1 : 0,
                                pointerEvents: isForgotPassword ? 'auto' : 'none',
                                transform: isForgotPassword ? 'scale(1)' : 'scale(1.04)',
                            }}
                        >
                            <div className="absolute rounded-full bg-white/10" style={{ width: 300, height: 300, bottom: -80, right: -80 }} />
                            <div className="absolute rounded-full bg-white/[0.06]" style={{ width: 200, height: 200, top: -60, left: -60 }} />

                            <div className="relative w-full max-w-sm px-10 text-center">
                                <img
                                    src="/Gemini_Generated_Image_d9cjlzd9cjlzd9cj-removebg-preview.png"
                                    alt="Logo"
                                    className="mx-auto mb-4 h-16 w-16 rounded-2xl object-contain shadow-lg"
                                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                />
                                <h2 className="mb-1 text-3xl font-extrabold text-white">Forgot Password?</h2>
                                <p className="mb-6 text-sm leading-relaxed text-teal-200">
                                    Enter your email and we'll send you a reset link
                                </p>

                                {status && (
                                    <div className="mb-4 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white">
                                        {status}
                                    </div>
                                )}

                                <Form {...passwordEmail.form()} className="space-y-4">
                                    {({ processing, errors }) => (
                                        <>
                                            <Input
                                                id="d-fp-email"
                                                type="email"
                                                name="email"
                                                required
                                                autoComplete="email"
                                                placeholder="Email Address"
                                                className="h-11 w-full rounded-lg border border-white/30 bg-white/10 text-white placeholder:text-teal-200 focus:border-white focus:outline-none focus:ring-0"
                                            />
                                            <InputError message={errors.email} className="mt-1 text-xs text-red-300" />
                                            <Button type="submit"
                                                className="h-11 w-full rounded-full bg-yellow-400 font-bold text-gray-900 hover:bg-yellow-500 active:bg-yellow-600"
                                                disabled={processing}>
                                                {processing && <Spinner />} SEND RESET LINK
                                            </Button>
                                            <button
                                                type="button"
                                                onClick={() => { setIsForgotPassword(false); setIsLogin(true); }}
                                                className="w-full text-center text-sm font-medium text-teal-200 hover:text-white transition-colors"
                                            >
                                                ← Back to Sign In
                                            </button>
                                        </>
                                    )}
                                </Form>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}