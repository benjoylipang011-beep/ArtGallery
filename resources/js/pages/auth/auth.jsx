import { useState, useRef, FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';

// ─── Types ───────────────────────────────────────────────────────────────────
type Props = {
    startTab?:         'login' | 'register';
    status?:           string;
    canResetPassword?: boolean;
    canRegister?:      boolean;
};

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);
const GithubIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
);
const LinkedInIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
);
const TwitterIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
    </svg>
);
const SpinnerIcon = () => (
    <svg style={{ animation: 'spin .8s linear infinite', marginRight: 8 }} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
        <path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);

// ─── Component ───────────────────────────────────────────────────────────────
export default function Auth({
    startTab       = 'login',
    status,
    canResetPassword = true,
    canRegister      = true,
}: Props) {
    const [isLogin, setIsLogin]       = useState(startTab === 'login');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors]         = useState<Record<string, string>>({});

    // Login form state
    const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });

    // Register form state
    const [regData, setRegData] = useState({
        name: '', email: '', password: '', password_confirmation: '',
    });

    // ── Submit handlers ──────────────────────────────────────────────────────
    function handleLogin(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        router.post('/login', loginData, {
            onError:  (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: ()     => setProcessing(false),
            onSuccess: ()    => { setLoginData({ email: '', password: '', remember: false }); },
        });
    }

    function handleRegister(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        router.post('/register', regData, {
            onError:  (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: ()     => setProcessing(false),
            onSuccess: ()    => { setRegData({ name: '', email: '', password: '', password_confirmation: '' }); },
        });
    }

    // ── Switch panel (also clear errors) ────────────────────────────────────
    function switchToRegister() { setErrors({}); setIsLogin(false); }
    function switchToLogin()    { setErrors({}); setIsLogin(true);  }

    const SOCIALS = [<GoogleIcon/>, <GithubIcon/>, <TwitterIcon/>, <LinkedInIcon/>];

    return (
        <>
            <Head title={isLogin ? 'Log in' : 'Create Account'} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Playfair+Display:wght@700&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .auth-wrap {
                    min-height: 100vh;
                    background: linear-gradient(135deg,#0f2027 0%,#1a3a2a 40%,#203a43 70%,#0d1f1a 100%);
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Nunito','Segoe UI',sans-serif;
                    padding: 20px; position: relative; overflow: hidden;
                }
                .blob1 {
                    position:absolute; width:500px; height:500px; border-radius:50%;
                    background:radial-gradient(circle,rgba(134,197,92,.09) 0%,transparent 70%);
                    top:-120px; left:-120px; pointer-events:none;
                }
                .blob2 {
                    position:absolute; width:420px; height:420px; border-radius:50%;
                    background:radial-gradient(circle,rgba(52,168,130,.07) 0%,transparent 70%);
                    bottom:-90px; right:-90px; pointer-events:none;
                }

                /* ── Card ── */
                .auth-card {
                    width: 860px; max-width: 100%; min-height: 540px;
                    background: #fff; border-radius: 28px; position: relative;
                    display: flex; overflow: hidden;
                    box-shadow: 0 40px 100px rgba(0,0,0,.38), 0 0 0 1px rgba(255,255,255,.04);
                }

                /* ── Dark sliding panel ── */
                .panel {
                    position: absolute; top: 0; bottom: 0; width: 42%;
                    background: linear-gradient(155deg,#1b3d2b 0%,#0f2d1f 55%,#162e22 100%);
                    z-index: 10; display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    padding: 44px 36px; text-align: center;
                    transition: left .75s cubic-bezier(.77,0,.175,1),
                                right .75s cubic-bezier(.77,0,.175,1);
                }
                .panel.left  { left:0; right:auto; border-radius:0 24px 24px 0; box-shadow: 6px 0 36px rgba(0,0,0,.22); }
                .panel.right { left:auto; right:0;  border-radius:24px 0 0 24px; box-shadow:-6px 0 36px rgba(0,0,0,.22); }

                .panel-logo {
                    width:54px; height:54px; border-radius:16px; margin-bottom:22px;
                    background:linear-gradient(135deg,rgba(134,197,92,.22),rgba(90,171,120,.12));
                    border:2px solid rgba(134,197,92,.32);
                    display:flex; align-items:center; justify-content:center;
                }
                .panel-title {
                    font-family:'Playfair Display',serif; font-size:27px; font-weight:700;
                    color:#fff; margin-bottom:12px; line-height:1.25;
                }
                .panel-desc {
                    font-size:13.5px; color:rgba(255,255,255,.62);
                    line-height:1.7; margin-bottom:30px;
                }
                .panel-btn {
                    background:transparent; border:2px solid rgba(255,255,255,.65); color:#fff;
                    padding:11px 38px; border-radius:50px; font-size:12px; font-weight:700;
                    letter-spacing:1.5px; text-transform:uppercase; cursor:pointer;
                    font-family:'Nunito',sans-serif;
                    transition:background .3s,border-color .3s,transform .3s,box-shadow .3s;
                }
                .panel-btn:hover {
                    background:rgba(255,255,255,.14); border-color:#fff;
                    transform:translateY(-2px); box-shadow:0 8px 22px rgba(0,0,0,.22);
                }

                /* ── Form section ── */
                .form-wrap {
                    width:58%; padding:44px 42px; display:flex; flex-direction:column;
                    justify-content:center; overflow-y:auto;
                    transition:margin-left .75s cubic-bezier(.77,0,.175,1);
                }
                .form-wrap.ml-42 { margin-left:42%; }
                .form-wrap.ml-0  { margin-left:0;   }

                .form-title {
                    font-family:'Playfair Display',serif; font-size:26px; font-weight:700;
                    color:#1a3a2a; margin-bottom:4px;
                }
                .form-sub { font-size:13px; color:#8a9e94; margin-bottom:18px; }

                /* ── Social buttons ── */
                .socials { display:flex; gap:10px; justify-content:center; margin-bottom:16px; }
                .social-btn {
                    width:42px; height:42px; border-radius:11px;
                    border:1.5px solid #e0ebe5; background:#fff;
                    display:flex; align-items:center; justify-content:center;
                    cursor:pointer; color:#444;
                    transition:background .2s,border-color .2s,transform .2s,box-shadow .2s;
                }
                .social-btn:hover {
                    background:#f0f7f4; border-color:#86c55c;
                    transform:translateY(-2px); box-shadow:0 4px 12px rgba(134,197,92,.22);
                }

                /* ── Divider ── */
                .divider {
                    display:flex; align-items:center; gap:12px; margin-bottom:16px;
                    color:#aac0b6; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;
                }
                .divider::before,.divider::after { content:''; flex:1; height:1px; background:#e4ede9; }

                /* ── Inputs ── */
                .field { margin-bottom:11px; }
                .field-label {
                    display:block; font-size:11px; font-weight:700; color:#4a6a5a;
                    margin-bottom:5px; letter-spacing:.5px; text-transform:uppercase;
                }
                .field-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:5px; }
                .auth-input {
                    width:100%; padding:10px 14px; border:1.5px solid #ddeae3; border-radius:10px;
                    font-size:13.5px; color:#1a3a2a; background:#f8fdf9;
                    font-family:'Nunito',sans-serif; outline:none;
                    transition:border-color .25s,background .25s,box-shadow .25s;
                }
                .auth-input:focus { border-color:#5aab78; background:#fff; box-shadow:0 0 0 3px rgba(90,171,120,.13); }
                .auth-input::placeholder { color:#b8cfc5; }
                .auth-input:disabled { opacity:.6; cursor:not-allowed; }
                .field-error { font-size:11.5px; color:#e05252; font-weight:600; margin-top:4px; }

                /* ── Two-col grid ── */
                .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:0 12px; }

                /* ── Remember / forgot ── */
                .remember {
                    display:flex; align-items:center; gap:8px;
                    font-size:13px; color:#5a7a6a; cursor:pointer; margin-bottom:14px;
                }
                .remember input[type=checkbox] { accent-color:#5aab78; width:14px; height:14px; cursor:pointer; }
                .forgot { font-size:11.5px; color:#5aab78; text-decoration:none; font-weight:700; transition:color .2s; }
                .forgot:hover { color:#3a8a58; }

                /* ── Submit button ── */
                .submit-btn {
                    width:100%; padding:12px; border:none; border-radius:11px;
                    background:linear-gradient(135deg,#5aab78 0%,#3d8f60 100%);
                    color:#fff; font-size:14px; font-weight:800; letter-spacing:.4px;
                    cursor:pointer; font-family:'Nunito',sans-serif; margin-bottom:14px;
                    display:flex; align-items:center; justify-content:center;
                    box-shadow:0 4px 20px rgba(90,171,120,.36);
                    transition:background .3s,transform .3s,box-shadow .3s;
                }
                .submit-btn:hover:not(:disabled) {
                    background:linear-gradient(135deg,#68c48a 0%,#4aab70 100%);
                    transform:translateY(-2px); box-shadow:0 8px 28px rgba(90,171,120,.46);
                }
                .submit-btn:active:not(:disabled) { transform:translateY(0); }
                .submit-btn:disabled { opacity:.7; cursor:not-allowed; }

                /* ── Switch text ── */
                .switch-text { text-align:center; font-size:13px; color:#8a9e94; }
                .switch-link { color:#5aab78; font-weight:800; cursor:pointer; transition:color .2s; }
                .switch-link:hover { color:#3a8a58; }

                /* ── Status banner ── */
                .status-banner {
                    background:#f0faf4; border:1px solid #a3d9b5; color:#2d7a4f;
                    border-radius:10px; padding:10px 14px; font-size:13px;
                    font-weight:600; margin-bottom:14px; text-align:center;
                }

                /* ── Animations ── */
                .fade-slide { animation:fadeSlide .4s ease forwards; }
                @keyframes fadeSlide { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
                @keyframes spin { to{transform:rotate(360deg)} }

                /* ── Mobile ── */
                @media(max-width:640px){
                    .auth-card { flex-direction:column; min-height:auto; border-radius:20px; }
                    .panel { position:static; width:100%; border-radius:20px 20px 0 0 !important; padding:28px 20px; box-shadow:none; }
                    .form-wrap { width:100%; margin-left:0 !important; padding:28px 20px; }
                    .grid2 { grid-template-columns:1fr; }
                }
            `}</style>

            <div className="auth-wrap">
                <div className="blob1" />
                <div className="blob2" />

                <div className="auth-card">

                    {/* ── Sliding dark panel ── */}
                    <div className={`panel ${isLogin ? 'left' : 'right'}`}>
                        <div className="panel-logo">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="rgba(134,197,92,.9)" strokeWidth="1.5" fill="none"/>
                                <circle cx="12" cy="12" r="3" fill="rgba(134,197,92,.65)"/>
                            </svg>
                        </div>

                        {isLogin ? (
                            <div className="fade-slide" key="p-login">
                                <div className="panel-title">Welcome Back!</div>
                                <p className="panel-desc">Enter your personal details to access all features of your account</p>
                                {canRegister && (
                                    <button className="panel-btn" onClick={switchToRegister}>Sign Up</button>
                                )}
                            </div>
                        ) : (
                            <div className="fade-slide" key="p-register">
                                <div className="panel-title">Hello, Friend!</div>
                                <p className="panel-desc">Register with your personal details to enjoy all our site features</p>
                                <button className="panel-btn" onClick={switchToLogin}>Sign In</button>
                            </div>
                        )}
                    </div>

                    {/* ── Form area ── */}
                    <div className={`form-wrap ${isLogin ? 'ml-42' : 'ml-0'}`}>

                        {/* ════ LOGIN ════ */}
                        {isLogin ? (
                            <div className="fade-slide" key="f-login">
                                <div className="form-title">Sign In</div>
                                <div className="form-sub">Use your social account or email to log in</div>

                                {status && <div className="status-banner">{status}</div>}

                                <div className="socials">
                                    {SOCIALS.map((icon, i) => (
                                        <button key={i} type="button" className="social-btn">{icon}</button>
                                    ))}
                                </div>

                                <div className="divider">or</div>

                                <form onSubmit={handleLogin}>
                                    <div className="field">
                                        <label className="field-label" htmlFor="l-email">Email Address</label>
                                        <input
                                            id="l-email"
                                            className="auth-input"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            disabled={processing}
                                            value={loginData.email}
                                            onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                                        />
                                        {errors.email && <div className="field-error">{errors.email}</div>}
                                    </div>

                                    <div className="field">
                                        <div className="field-row">
                                            <label className="field-label" htmlFor="l-password">Password</label>
                                            {canResetPassword && (
                                                <a href="/forgot-password" className="forgot">Forgot password?</a>
                                            )}
                                        </div>
                                        <input
                                            id="l-password"
                                            className="auth-input"
                                            type="password"
                                            name="password"
                                            required
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            disabled={processing}
                                            value={loginData.password}
                                            onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                                        />
                                        {errors.password && <div className="field-error">{errors.password}</div>}
                                    </div>

                                    <label className="remember">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={loginData.remember}
                                            disabled={processing}
                                            onChange={e => setLoginData({ ...loginData, remember: e.target.checked })}
                                        />
                                        Remember me
                                    </label>

                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <SpinnerIcon />}
                                        Log In
                                    </button>
                                </form>

                                {canRegister && (
                                    <p className="switch-text">
                                        Don't have an account?{' '}
                                        <span className="switch-link" onClick={switchToRegister}>Sign up here</span>
                                    </p>
                                )}
                            </div>

                        ) : (

                        /* ════ REGISTER ════ */
                            <div className="fade-slide" key="f-register">
                                <div className="form-title">Create Account</div>
                                <div className="form-sub">Or register with your social accounts</div>

                                <div className="socials">
                                    {SOCIALS.map((icon, i) => (
                                        <button key={i} type="button" className="social-btn">{icon}</button>
                                    ))}
                                </div>

                                <div className="divider">or fill in your details</div>

                                <form onSubmit={handleRegister}>
                                    <div className="grid2">
                                        <div className="field">
                                            <label className="field-label" htmlFor="r-name">Full Name</label>
                                            <input
                                                id="r-name"
                                                className="auth-input"
                                                type="text"
                                                name="name"
                                                required
                                                autoFocus
                                                autoComplete="name"
                                                placeholder="John Doe"
                                                value={regData.name}
                                                onChange={e => setRegData({ ...regData, name: e.target.value })}
                                            />
                                            {errors.name && <div className="field-error">{errors.name}</div>}
                                        </div>
                                        <div className="field">
                                            <label className="field-label" htmlFor="r-email">Email Address</label>
                                            <input
                                                id="r-email"
                                                className="auth-input"
                                                type="email"
                                                name="email"
                                                required
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                value={regData.email}
                                                onChange={e => setRegData({ ...regData, email: e.target.value })}
                                            />
                                            {errors.email && <div className="field-error">{errors.email}</div>}
                                        </div>
                                    </div>

                                    <div className="grid2">
                                        <div className="field">
                                            <label className="field-label" htmlFor="r-pass">Password</label>
                                            <input
                                                id="r-pass"
                                                className="auth-input"
                                                type="password"
                                                name="password"
                                                required
                                                autoComplete="new-password"
                                                placeholder="••••••••"
                                                value={regData.password}
                                                onChange={e => setRegData({ ...regData, password: e.target.value })}
                                            />
                                            {errors.password && <div className="field-error">{errors.password}</div>}
                                        </div>
                                        <div className="field">
                                            <label className="field-label" htmlFor="r-confirm">Confirm Password</label>
                                            <input
                                                id="r-confirm"
                                                className="auth-input"
                                                type="password"
                                                name="password_confirmation"
                                                required
                                                autoComplete="new-password"
                                                placeholder="••••••••"
                                                value={regData.password_confirmation}
                                                onChange={e => setRegData({ ...regData, password_confirmation: e.target.value })}
                                            />
                                            {errors.password_confirmation && <div className="field-error">{errors.password_confirmation}</div>}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        style={{ marginTop: 8 }}
                                        disabled={processing}
                                        data-test="register-user-button"
                                    >
                                        {processing && <SpinnerIcon />}
                                        Create Account
                                    </button>
                                </form>

                                <p className="switch-text">
                                    Already have an account?{' '}
                                    <span className="switch-link" onClick={switchToLogin}>Sign in here</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}