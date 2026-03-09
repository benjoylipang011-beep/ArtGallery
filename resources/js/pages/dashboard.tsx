import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useCallback } from 'react';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

// ── Types ──────────────────────────────────────────────────────────────────────
interface Artwork {
    id: number;
    title: string;
    artist: string;
    medium: string;
    year: number;
    price: number;
    category: string;
    status: string;
    image: string | null;
    saved: boolean;
}

interface SavedArtwork {
    id: number;
    title: string;
    artist: string;
    medium: string;
    price: number;
    image: string | null;
}

interface Stats {
    totalArtworks: number;
    savedCount: number;
    liveExhibitions: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const GRADIENTS = [
    'bg-gradient-to-br from-blue-400 to-blue-700',
    'bg-gradient-to-br from-amber-300 to-orange-500',
    'bg-gradient-to-br from-rose-300 to-pink-600',
    'bg-gradient-to-br from-neutral-500 to-neutral-800',
    'bg-gradient-to-br from-yellow-300 to-amber-600',
    'bg-gradient-to-br from-teal-300 to-cyan-700',
];

function formatPrice(price: number) {
    return '₱' + Number(price ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

function csrfToken(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

// ── Artwork Card ───────────────────────────────────────────────────────────────
function ArtworkCard({ artwork, index, onToggleSave }: {
    artwork: Artwork;
    index: number;
    onToggleSave: (id: number) => void;
}) {
    const grad = GRADIENTS[index % GRADIENTS.length];
    return (
        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
            <div className={`h-44 relative flex items-end justify-between p-3 ${!artwork.image ? grad : ''}`}>
                {artwork.image && (
                    <img src={artwork.image} alt={artwork.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <span className="relative z-10 text-white/80 text-xs font-mono drop-shadow">{artwork.medium} · {artwork.year}</span>
                <span className={`relative z-10 text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${artwork.status === 'available' ? 'bg-white/20 text-white' : 'bg-black/30 text-white/60'}`}>
                    {artwork.status === 'available' ? 'Available' : 'Sold'}
                </span>
            </div>
            <div className="p-4 flex flex-col gap-1 flex-1">
                <p className="font-semibold text-neutral-900 dark:text-white text-sm leading-tight truncate">{artwork.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{artwork.artist}</p>
                {artwork.category && (
                    <span className="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full w-fit">{artwork.category}</span>
                )}
                <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-amber-500">{formatPrice(artwork.price)}</span>
                    <button onClick={() => onToggleSave(artwork.id)}
                        className={`text-lg leading-none transition-all duration-150 select-none ${artwork.saved ? 'text-rose-500 scale-110' : 'text-neutral-300 hover:text-rose-400'}`}
                        title={artwork.saved ? 'Unsave' : 'Save'}>
                        {artwork.saved ? '♥' : '♡'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Saved Row ──────────────────────────────────────────────────────────────────
function SavedRow({ artwork, onRemove }: { artwork: SavedArtwork; onRemove: (id: number) => void }) {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
            {artwork.image
                ? <img src={artwork.image} alt={artwork.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                : <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-200 to-amber-500 flex-shrink-0" />
            }
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{artwork.title}</p>
                <p className="text-xs text-neutral-400">{artwork.artist} · {artwork.medium}</p>
            </div>
            <div className="text-right shrink-0">
                <p className="text-sm font-bold text-amber-500">{formatPrice(artwork.price)}</p>
                <button onClick={() => onRemove(artwork.id)} className="text-xs text-neutral-400 hover:text-rose-400 transition-colors mt-0.5">Remove</button>
            </div>
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
    // Pull ALL page props — safely handle anything the controller sends
    const page = usePage();
    const rawProps = page.props as Record<string, unknown>;

    const initArtworks: Artwork[]   = Array.isArray(rawProps.artworks)      ? (rawProps.artworks as Artwork[])           : [];
    const initSaved: SavedArtwork[] = Array.isArray(rawProps.savedArtworks) ? (rawProps.savedArtworks as SavedArtwork[]) : [];
    const rawStats                  = (rawProps.stats && typeof rawProps.stats === 'object') ? rawProps.stats as Partial<Stats> : {};
    const initStats: Stats = {
        totalArtworks:   Number(rawStats.totalArtworks   ?? 0),
        savedCount:      Number(rawStats.savedCount      ?? 0),
        liveExhibitions: Number(rawStats.liveExhibitions ?? 0),
    };

    const [artworks, setArtworks]   = useState<Artwork[]>(initArtworks);
    const [savedArtworks, setSaved] = useState<SavedArtwork[]>(initSaved);
    const [stats, setStats]         = useState<Stats>(initStats);

    // ── Toggle save ♡ ──────────────────────────────────────────────────────────
    const handleToggleSave = useCallback(async (artworkId: number) => {
        const target = artworks.find(a => a.id === artworkId);
        if (!target) return;
        const wasSaved = target.saved;

        setArtworks(prev => prev.map(a => a.id === artworkId ? { ...a, saved: !a.saved } : a));
        if (wasSaved) {
            setSaved(prev => prev.filter(a => a.id !== artworkId));
            setStats(prev => ({ ...prev, savedCount: Math.max(0, prev.savedCount - 1) }));
        } else {
            setSaved(prev => [{ id: target.id, title: target.title, artist: target.artist, medium: target.medium, price: target.price, image: target.image }, ...prev]);
            setStats(prev => ({ ...prev, savedCount: prev.savedCount + 1 }));
        }

        try {
            const res = await axios.post(`/artworks/${artworkId}/save`, {}, { headers: { 'X-CSRF-TOKEN': csrfToken() } });
            setStats(prev => ({ ...prev, savedCount: res.data.savedCount }));
        } catch {
            // Rollback
            setArtworks(prev => prev.map(a => a.id === artworkId ? { ...a, saved: wasSaved } : a));
            setSaved(wasSaved
                ? prev => [{ id: target.id, title: target.title, artist: target.artist, medium: target.medium, price: target.price, image: target.image }, ...prev]
                : prev => prev.filter(a => a.id !== artworkId)
            );
            setStats(initStats);
        }
    }, [artworks, initStats]);

    // ── Remove saved ────────────────────────────────────────────────────────────
    const handleRemoveSaved = useCallback(async (artworkId: number) => {
        setSaved(prev => prev.filter(a => a.id !== artworkId));
        setArtworks(prev => prev.map(a => a.id === artworkId ? { ...a, saved: false } : a));
        setStats(prev => ({ ...prev, savedCount: Math.max(0, prev.savedCount - 1) }));
        try {
            const res = await axios.delete(`/artworks/${artworkId}/save`, { headers: { 'X-CSRF-TOKEN': csrfToken() } });
            setStats(prev => ({ ...prev, savedCount: res.data.savedCount }));
        } catch { /* silent */ }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">

                {/* Welcome Banner */}
                <div className="rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700 dark:from-neutral-800 dark:to-neutral-900 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">Welcome back</p>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Discover Art You'll Love</h1>
                        <p className="text-neutral-400 text-sm mt-1">Explore curated artworks and upcoming exhibitions.</p>
                    </div>
                    <div className="hidden md:flex flex-col gap-1 items-end">
                        <a href="/products" className="text-xs bg-amber-400 hover:bg-amber-500 text-neutral-900 font-semibold px-4 py-2 rounded-lg transition-colors">
                            Browse All Artworks →
                        </a>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    {([
                        { label: 'Artworks Available', value: stats.totalArtworks.toLocaleString(), sub: 'Total in the gallery', accent: 'bg-amber-400' },
                        { label: 'Saved by You', value: stats.savedCount.toLocaleString(), sub: `${stats.savedCount === 1 ? '1 artwork' : stats.savedCount + ' artworks'} saved`, accent: 'bg-rose-400' },
                        { label: 'Live Exhibitions', value: stats.liveExhibitions.toLocaleString(), sub: 'Open for viewing now', accent: 'bg-sky-400' },
                    ] as const).map((stat) => (
                        <div key={stat.label} className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-6 flex flex-col gap-2">
                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${stat.accent}`} />
                            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{stat.label}</span>
                            <span className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight transition-all duration-300">{stat.value}</span>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">{stat.sub}</span>
                        </div>
                    ))}
                </div>

                {/* Artworks + Saved Panel */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Browse Artworks</h2>
                            <a href="/products" className="text-xs text-amber-500 hover:underline">View all →</a>
                        </div>
                        {artworks.length === 0
                            ? <div className="flex items-center justify-center h-40 text-neutral-400 text-sm">No artworks yet.</div>
                            : <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {artworks.map((artwork, i) => (
                                    <ArtworkCard key={artwork.id} artwork={artwork} index={i} onToggleSave={handleToggleSave} />
                                ))}
                            </div>
                        }
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Saved Artworks</h2>
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">{stats.savedCount}</span>
                        </div>
                        {savedArtworks.length === 0
                            ? <div className="flex flex-col items-center justify-center h-32 gap-2">
                                <span className="text-3xl text-neutral-200 dark:text-neutral-700">♡</span>
                                <p className="text-xs text-neutral-400 text-center">Tap ♡ on any artwork<br />to save it here.</p>
                            </div>
                            : <div className="flex flex-col">
                                {savedArtworks.map(a => <SavedRow key={a.id} artwork={a} onRemove={handleRemoveSaved} />)}
                            </div>
                        }
                    </div>
                </div>

                {/* Exhibitions */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Exhibitions</h2>
                        <a href="#" className="text-xs text-amber-500 hover:underline">View all →</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-neutral-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-800">
                                    <th className="pb-2 pr-4 font-medium">Exhibition</th>
                                    <th className="pb-2 pr-4 font-medium">Curator</th>
                                    <th className="pb-2 pr-4 font-medium">Date</th>
                                    <th className="pb-2 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: 'Modern Visions 2024', curator: 'Maria Santos', date: 'Mar 5 – Apr 2', status: 'Active', color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
                                    { name: 'Echoes of the Earth', curator: 'Liam Reyes', date: 'Apr 10 – May 15', status: 'Upcoming', color: 'text-sky-500 bg-sky-50 dark:bg-sky-900/20' },
                                    { name: 'Fragments & Forms', curator: 'Ana Villanueva', date: 'May 20 – Jun 30', status: 'Planning', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
                                    { name: 'Urban Pulse', curator: 'Carlos Bautista', date: 'Jul 1 – Aug 10', status: 'Planning', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
                                ].map((ex) => (
                                    <tr key={ex.name} className="border-b border-neutral-50 dark:border-neutral-800/50 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="py-3 pr-4 font-medium text-neutral-800 dark:text-neutral-200">{ex.name}</td>
                                        <td className="py-3 pr-4 text-neutral-500">{ex.curator}</td>
                                        <td className="py-3 pr-4 text-neutral-500">{ex.date}</td>
                                        <td className="py-3">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ex.color}`}>{ex.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}