import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    const [showArtShowcase, setShowArtShowcase] = useState(false);
    const [showGrid, setShowGrid] = useState(false);

    // Auto transition from scatter to grid after 2 seconds
    useEffect(() => {
        if (showArtShowcase && !showGrid) {
            const timer = setTimeout(() => setShowGrid(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [showArtShowcase, showGrid]);

    // Array of your art images - update these paths with your actual image locations
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
                    href="https://fonts.bunny.net/css?family=playfair-display:400,700,900|dm-sans:300,400,500"
                    rel="stylesheet"
                />
            </Head>

            {/* Custom Animations */}
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
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
                .delay-600 { animation-delay: 0.6s; }
                .delay-700 { animation-delay: 0.7s; }
                @keyframes scatter {
                    0% { opacity: 0; transform: scale(0.8); }
                    30% { opacity: 1; transform: rotate(var(--rotation)) translateX(var(--tx)) translateY(var(--ty)) scale(1); }
                    100% { opacity: 1; transform: rotate(var(--rotation)) translateX(var(--tx)) translateY(var(--ty)) scale(1); }
                }
                @keyframes gridArrange {
                    0% { opacity: 0; transform: rotate(var(--rotation)) translateX(var(--tx)) translateY(var(--ty)) scale(1); }
                    100% { opacity: 1; transform: rotate(0deg) translateX(0) translateY(0) scale(1); }
                }
                .animate-scatter {
                    animation: scatter 1.5s ease-out forwards;
                }
                .animate-grid-arrange {
                    animation: gridArrange 1s ease-in-out forwards;
                }
            `}</style>

            <div
                className="relative min-h-screen flex flex-col overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #111318 50%, #0d0f14 100%)',
                    fontFamily: "'DM Sans', sans-serif",
                }}
            >
                {/* Ambient background blobs with floating animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 animate-float" style={{ background: 'radial-gradient(circle, #1e3a8a, transparent)', animationDelay: '0s' }} />
                    <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-10 animate-float" style={{ background: 'radial-gradient(circle, #1d4ed8, transparent)', animationDelay: '2s' }} />
                    <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-8 animate-float" style={{ background: 'radial-gradient(circle, #0369a1, transparent)', animationDelay: '4s' }} />
                </div>

                {/* Fine grain overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                }} />

                {/* Nav with fade-in */}
                <header className="relative z-10 flex items-center justify-between px-8 py-6 lg:px-16 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <img
                            src="/Gemini_Generated_Image_d9cjlzd9cjlzd9cj-removebg-preview.png"
                            alt="Bench Art Gallery"
                            className="w-10 h-10 object-contain"
                        />
                        <span className="text-white font-semibold text-sm tracking-wide hidden sm:block">Bench Art Gallery</span>
                    </div>

                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="px-5 py-2 rounded-lg text-sm font-medium text-white border border-white/20 hover:bg-white/10 transition-all"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="px-5 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="px-5 py-2 rounded-lg text-sm font-medium text-white border border-white/20 hover:bg-white/10 transition-all"
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero */}
                <main className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6 py-4 lg:py-6">

                   

                    {/* Logo with scale-in */}
                    <div className="mb-3 opacity-0 animate-scale-in">
                        <img
                            src="/Gemini_Generated_Image_d9cjlzd9cjlzd9cj-removebg-preview.png"
                            alt="Bench Art Gallery Logo"
                            className="w-28 h-28 object-contain mx-auto drop-shadow-2xl"
                        />
                    </div>

                    {/* Headline with staggered animation */}
                    <h1
                        className="text-4xl lg:text-5xl font-black text-white leading-tight mb-2 max-w-3xl"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        <span className="block opacity-0 animate-fade-in-up delay-100">
                            Bench
                        </span>
                        <span className="block text-transparent bg-clip-text opacity-0 animate-fade-in-up delay-200" style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #3b82f6, #1d4ed8)' }}>
                            Art Gallery
                        </span>
                    </h1>

                    <p className="text-white/40 text-lg max-w-md mb-4 leading-relaxed font-light opacity-0 animate-fade-in-up delay-300">
                        Manage your artworks, artists, and exhibitions — all in one beautiful platform.
                    </p>

                    {/* CTA Buttons with fade-in */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 opacity-0 animate-fade-in-up delay-400">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-800/50 hover:opacity-90"
                                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                            >
                                Go to Dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-800/50 hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg, #57a770, #17926f)' }}
                                >
                                    Enter Gallery →
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all"
                                    >
                                        Create Account
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* Art Showcase Button */}
                    <div className="mt-4 opacity-0 animate-fade-in delay-500">
                        <button
                            onClick={() => {
                                setShowArtShowcase(!showArtShowcase);
                                setShowGrid(false);
                            }}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-white/70 border border-white/20 backdrop-blur-md transition-all hover:text-white hover:border-white/40 hover:bg-white/10"
                            style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(2px)' }}
                        >
                            Art Showcase
                        </button>
                    </div>
                </main>

                {/* Art Showcase Modal */}
                {showArtShowcase && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                        <div className="relative w-full h-full flex items-center justify-center">
                            {!showGrid ? (
                                // Scatter animation phase
                                <div className="relative w-screen h-screen flex items-center justify-center">
                                    {artImages.map((image, index) => {
                                        const rotations = [-15, -25, 10, 20, -10, 15];
                                        const txValues = [-120, -60, 60, 100, -100, 120];
                                        const tyValues = [-100, 60, -80, 100, 80, -60];

                                        return (
                                            // Outer div: centers the card at the middle of the screen
                                            <div
                                                key={image}
                                                className="absolute"
                                                style={{
                                                    left: '50%',
                                                    top: '50%',
                                                    marginLeft: '-144px', // half of w-72 (288px)
                                                    marginTop: '-144px',  // half of h-72 (288px)
                                                }}
                                            >
                                                {/* Inner div: handles only the scatter animation */}
                                                <div
                                                    className="w-72 h-72 animate-scatter"
                                                    style={{
                                                        '--rotation': `${rotations[index]}deg`,
                                                        '--tx': `${txValues[index]}px`,
                                                        '--ty': `${tyValues[index]}px`,
                                                        animationDelay: `${index * 100}ms`,
                                                    } as React.CSSProperties}
                                                >
                                                    <div className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden relative">
                                                        {/* Image fills the card */}
                                                        <img
                                                            src={image}
                                                            alt={`Art ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                            style={{ opacity: 0 }}
                                                            onLoad={(e) => {
                                                                (e.currentTarget as HTMLImageElement).style.opacity = '1';
                                                            }}
                                                            onError={(e) => {
                                                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                        {/* Label always visible at bottom */}
                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-4 py-3">
                                                            <span className="text-white/80 text-sm font-semibold">Art {index + 1}</span>
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
                                    className="relative bg-white/5 border border-white/10 rounded-2xl max-w-5xl w-full mx-4 animate-scale-in flex flex-col"
                                    style={{ maxHeight: '90vh' }}
                                >
                                    {/* Sticky Header */}
                                    <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            Art Gallery
                                        </h2>
                                        <button
                                            onClick={() => setShowArtShowcase(false)}
                                            className="text-white/50 hover:text-white text-3xl leading-none transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {/* Scrollable Grid */}
                                    <div className="overflow-y-auto px-6 pb-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {artImages.map((image, index) => (
                                            <div
                                                key={image}
                                                className="rounded-lg opacity-0 animate-fade-in-up"
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <div className="aspect-square bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-all relative">
                                                    {/* Fallback label */}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-white/20 text-sm">Art {index + 1}</span>
                                                    </div>
                                                    {/* Image */}
                                                    <img
                                                        src={image}
                                                        alt={`Art ${index + 1}`}
                                                        className="relative z-10 w-full h-full object-cover transition-opacity duration-300"
                                                        style={{ opacity: 0 }}
                                                        onLoad={(e) => {
                                                            (e.currentTarget as HTMLImageElement).style.opacity = '1';
                                                        }}
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                    {/* Label overlay at bottom */}
                                                    <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                                                        <span className="text-white/80 text-sm font-medium">Art {index + 1}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    </div>{/* end scrollable */}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                
            </div>
        </>
    );
}