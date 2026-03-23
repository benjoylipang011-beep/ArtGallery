import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { dashboard, login, register } from '@/routes';
import { useAppearance } from '@/hooks/use-appearance';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;
    const { resolvedAppearance } = useAppearance();
    const [showArtShowcase, setShowArtShowcase] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const isDark = resolvedAppearance === 'dark';
    const [fading, setFading] = useState(false);

    const navigateTo = (href: string) => {
        setFading(true);
        setTimeout(() => router.visit(href), 400);
    };

    useEffect(() => {
        if (showArtShowcase && !showGrid) {
            const timer = setTimeout(() => setShowGrid(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [showArtShowcase, showGrid]);

    const artImages = [
        '/HHFqJvKW.jpg',
        '/BFN0Cqfc.jpg',
        '/NJTy1wTn.jpg',
        '/nTTToKAB.jpg',
        '/Pe7B_Fx7.jpg',
        '/wF_PajWC.jpg',
    ];

    return (
        <>
            <Head title="Bench Art Gallery">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:300,400,500,600,700|playfair-display:400,700"
                    rel="stylesheet"
                />
            </Head>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes scatter {
                    0% { opacity: 0; transform: scale(0.8); }
                    30% { opacity: 1; transform: rotate(var(--rotation)) translateX(var(--tx)) translateY(var(--ty)) scale(1); }
                    100% { opacity: 1; transform: rotate(var(--rotation)) translateX(var(--tx)) translateY(var(--ty)) scale(1); }
                }
                @keyframes gridArrange {
                    0% { opacity: 0; transform: rotate(var(--rotation)) translateX(var(--tx)) translateY(var(--ty)) scale(1); }
                    100% { opacity: 1; transform: rotate(0deg) translateX(0) translateY(0) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease-out forwards;
                }
                .animate-scale-in {
                    animation: scaleIn 0.6s ease-out forwards;
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                .animate-scatter {
                    animation: scatter 1.5s ease-out forwards;
                }
                .animate-grid-arrange {
                    animation: gridArrange 1s ease-in-out forwards;
                }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
            `}</style>

            <div
                className={`relative min-h-screen flex flex-col overflow-hidden transition-all duration-400 ${
                    isDark ? 'bg-neutral-950' : 'bg-white'
                }`}
                style={{
                    opacity: fading ? 0 : 1,
                    transform: fading ? 'scale(0.98)' : 'scale(1)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                }}
            >
                {/* Subtle background gradient */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: isDark
                            ? 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 70%, rgba(37, 99, 235, 0.06) 0%, transparent 40%)'
                            : 'radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 40%), radial-gradient(circle at 90% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 40%)',
                    }}
                />

                {/* Floating orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 animate-float" style={{ background: isDark ? 'radial-gradient(circle, #1e3a8a, transparent)' : 'radial-gradient(circle, #bfdbfe, transparent)', animationDelay: '0s' }} />
                    <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-10 animate-float" style={{ background: isDark ? 'radial-gradient(circle, #1d4ed8, transparent)' : 'radial-gradient(circle, #93c5fd, transparent)', animationDelay: '2s' }} />
                    <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-8 animate-float" style={{ background: isDark ? 'radial-gradient(circle, #0369a1, transparent)' : 'radial-gradient(circle, #7dd3fc, transparent)', animationDelay: '4s' }} />
                </div>

                {/* Fine grain texture */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                }} />

                {/* Header */}
                <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <img
                            src="/Gemini_Generated_Image_dkoz8wdkoz8wdkoz-removebg-preview.png"
                            alt="Bench Art Gallery"
                            className="w-12 h-12 object-contain"
                        />
                        <span className="text-neutral-800 dark:text-neutral-200 font-medium text-sm tracking-wide hidden sm:block">
                            Bench Art Gallery
                        </span>
                    </div>

                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <button
                                onClick={() => navigateTo(dashboard())}
                                className="px-5 py-2 rounded-full text-sm font-medium text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                            >
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigateTo(login())}
                                    className="px-5 py-2 rounded-full text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                                >
                                    Log in
                                </button>
                                {canRegister && (
                                    <button
                                        onClick={() => navigateTo(register())}
                                        className="px-5 py-2 rounded-full text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all"
                                    >
                                        Register
                                    </button>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero */}
                <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        {/* Logo with scale-in */}
                        <div className="mb-6 opacity-0 animate-scale-in">
                            <img
                                src="/Gemini_Generated_Image_dkoz8wdkoz8wdkoz-removebg-preview.png"
                                alt="Bench Art Gallery Logo"
                                className="w-24 h-24 md:w-28 md:h-28 object-contain mx-auto drop-shadow-xl"
                            />
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-neutral-900 dark:text-white mb-4">
                            <span className="block opacity-0 animate-fade-in-up delay-100">
                                Bench
                            </span>
                            <span
                                className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 opacity-0 animate-fade-in-up delay-200"
                            >
                                Art Gallery
                            </span>
                        </h1>

                        <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto mb-8 font-light opacity-0 animate-fade-in-up delay-300">
                            Manage your artworks, artists, and exhibitions — all in one beautiful platform.
                        </p>

                        {/* CTA */}
                        {auth.user && (
                            <div className="opacity-0 animate-fade-in-up delay-400">
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center px-8 py-4 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                                >
                                    Go to Dashboard
                                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        )}

                        {/* Art Showcase trigger */}
                        <div className="mt-8 opacity-0 animate-fade-in delay-500">
                            <button
                                onClick={() => {
                                    setShowArtShowcase(true);
                                    setShowGrid(false);
                                }}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                            >
                                <span>Art Showcase</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </main>

                {/* Art Showcase Modal */}
                {showArtShowcase && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
                        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }}
                    >
                        <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
                            {!showGrid ? (
                                // Scatter phase
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {artImages.map((image, index) => {
                                        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                                        const cardPx = isMobile ? 88 : 160;
                                        const rotations = [-12, 18, -8, 22, -15, 10];
                                        const txValues = isMobile
                                            ? [-80, -45, 55, 75, -65, 80]
                                            : [-180, -100, 120, 160, -140, 170];
                                        const tyValues = isMobile
                                            ? [-55, 40, -60, 65, 45, -42]
                                            : [-120, 90, -130, 140, 100, -90];

                                        return (
                                            <div
                                                key={image}
                                                className="absolute"
                                                style={{
                                                    left: '50%',
                                                    top: '50%',
                                                    marginLeft: `-${cardPx}px`,
                                                    marginTop: `-${cardPx}px`,
                                                }}
                                            >
                                                <div
                                                    className={`${isMobile ? 'w-44 h-44' : 'w-80 h-80'} animate-scatter`}
                                                    style={{
                                                        '--rotation': `${rotations[index]}deg`,
                                                        '--tx': `${txValues[index]}px`,
                                                        '--ty': `${tyValues[index]}px`,
                                                        animationDelay: `${index * 80}ms`,
                                                    } as React.CSSProperties}
                                                >
                                                    <div className="w-full h-full bg-white dark:bg-neutral-800 rounded-xl shadow-2xl overflow-hidden relative">
                                                        <img
                                                            src={image}
                                                            alt={`Art ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                            style={{ opacity: 0 }}
                                                            onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                                        />
                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
                                                            <span className="text-white/90 text-sm font-medium">Art {index + 1}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                // Grid phase
                                <div
                                    className="relative w-full h-full bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col animate-scale-in"
                                >
                                    {/* Modal header */}
                                    <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
                                        <h2 className="text-2xl font-serif text-neutral-900 dark:text-white">
                                            Art Gallery
                                        </h2>
                                        <button
                                            onClick={() => setShowArtShowcase(false)}
                                            className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white text-3xl leading-none transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {/* Scrollable grid */}
                                    <div className="flex-1 overflow-y-auto p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {artImages.map((image, index) => (
                                                <div
                                                    key={image}
                                                    className="opacity-0 animate-fade-in-up"
                                                    style={{ animationDelay: `${index * 80}ms` }}
                                                >
                                                    <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all relative group">
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-neutral-400 dark:text-neutral-600 text-sm">
                                                                Art {index + 1}
                                                            </span>
                                                        </div> 
                                                        <img
                                                            src={image}
                                                            alt={`Art ${index + 1}`}
                                                            className="relative z-10 w-full h-full object-cover opacity-0 group-hover:scale-105 transition-transform duration-300"
                                                            onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                                        />
                                                        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-white/90 text-sm font-medium">Art {index + 1}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}