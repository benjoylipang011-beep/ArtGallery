import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useCallback } from 'react';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface Artwork {
    id: number; title: string; artist: string; medium: string;
    year: number; price: number; category: string; status: string;
    image: string | null; saved: boolean;
}
interface SavedArtwork {
    id: number; title: string; artist: string; medium: string;
    price: number; image: string | null;
}
interface Stats {
    totalArtworks: number; savedCount: number; liveExhibitions: number;
    myArtworks: number; myOrders: number; myRevenue: number;
    myCartCount: number; myPendingOrders: number;
}
interface ChartItem  { label: string; count: number; }
interface TopArtwork { title: string; artist: string; price: number; status: string; }
interface Analytics {
    byCategory: ChartItem[]; byStatus: ChartItem[]; byMedium: ChartItem[];
    topArtworks: TopArtwork[]; monthlyArtworks: ChartItem[];
}

const GRADIENTS = [
    'bg-gradient-to-br from-blue-400 to-blue-700',
    'bg-gradient-to-br from-amber-300 to-orange-500',
    'bg-gradient-to-br from-rose-300 to-pink-600',
    'bg-gradient-to-br from-neutral-500 to-neutral-800',
    'bg-gradient-to-br from-yellow-300 to-amber-600',
    'bg-gradient-to-br from-teal-300 to-cyan-700',
];
const BAR_COLORS = ['bg-amber-400','bg-rose-400','bg-sky-400','bg-emerald-400','bg-purple-400','bg-orange-400'];

function formatPrice(price: number) {
    return '₱' + Number(price ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
}
function csrfToken(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

function StatCard({ label, value, sub, accent, emoji }: { label: string; value: string; sub: string; accent: string; emoji: string; }) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5 flex flex-col gap-2">
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10 ${accent}`} />
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{label}</span>
                <span className="text-xl">{emoji}</span>
            </div>
            <span className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">{value}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{sub}</span>
        </div>
    );
}

function BarChart({ data, title }: { data: ChartItem[]; title: string }) {
    if (!data || !data.length) return (
        <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">{title}</h3>
            <p className="text-xs text-neutral-400 py-4 text-center">No data yet</p>
        </div>
    );
    const max = Math.max(...data.map(d => d.count));
    return (
        <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">{title}</h3>
            <div className="flex flex-col gap-2">
                {data.map((item, i) => (
                    <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 w-24 truncate shrink-0">{item.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                            <div className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 w-6 text-right shrink-0">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ArtworkCard({ artwork, index, onToggleSave }: { artwork: Artwork; index: number; onToggleSave: (id: number) => void; }) {
    const grad = GRADIENTS[index % GRADIENTS.length];
    return (
        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
            <div className={`h-44 relative flex items-end justify-between p-3 ${!artwork.image ? grad : ''}`}>
                {artwork.image && <img src={artwork.image} alt={artwork.title} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                <span className="relative z-10 text-white/80 text-xs font-mono drop-shadow">{artwork.medium} · {artwork.year}</span>
                <span className={`relative z-10 text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${artwork.status === 'available' ? 'bg-white/20 text-white' : 'bg-black/30 text-white/60'}`}>
                    {artwork.status === 'available' ? 'Available' : 'Sold'}
                </span>
            </div>
            <div className="p-4 flex flex-col gap-1 flex-1">
                <p className="font-semibold text-neutral-900 dark:text-white text-sm leading-tight truncate">{artwork.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{artwork.artist}</p>
                {artwork.category && <span className="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full w-fit">{artwork.category}</span>}
                <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-amber-500">{formatPrice(artwork.price)}</span>
                    <button onClick={() => onToggleSave(artwork.id)} className={`text-lg leading-none transition-all duration-150 select-none ${artwork.saved ? 'text-rose-500 scale-110' : 'text-neutral-300 hover:text-rose-400'}`}>
                        {artwork.saved ? '♥' : '♡'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SavedRow({ artwork, onRemove }: { artwork: SavedArtwork; onRemove: (id: number) => void }) {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
            {artwork.image
                ? <img src={artwork.image} alt={artwork.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                : <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-200 to-amber-500 flex-shrink-0" />}
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

export default function Dashboard() {
    const page = usePage();
    const rawProps = page.props as Record<string, unknown>;

    const initArtworks: Artwork[]   = Array.isArray(rawProps.artworks)      ? (rawProps.artworks as Artwork[])           : [];
    const initSaved: SavedArtwork[] = Array.isArray(rawProps.savedArtworks) ? (rawProps.savedArtworks as SavedArtwork[]) : [];
    const rawStats                  = (rawProps.stats && typeof rawProps.stats === 'object') ? rawProps.stats as Partial<Stats> : {};
    const analytics                 = (rawProps.analytics && typeof rawProps.analytics === 'object') ? rawProps.analytics as Analytics : null;

    const initStats: Stats = {
        totalArtworks:   Number(rawStats.totalArtworks   ?? 0),
        savedCount:      Number(rawStats.savedCount      ?? 0),
        liveExhibitions: Number(rawStats.liveExhibitions ?? 0),
        myArtworks:      Number(rawStats.myArtworks      ?? 0),
        myOrders:        Number(rawStats.myOrders        ?? 0),
        myRevenue:       Number(rawStats.myRevenue       ?? 0),
        myCartCount:     Number(rawStats.myCartCount     ?? 0),
        myPendingOrders: Number(rawStats.myPendingOrders ?? 0),
    };

    const [artworks, setArtworks]   = useState<Artwork[]>(initArtworks);
    const [savedArtworks, setSaved] = useState<SavedArtwork[]>(initSaved);
    const [stats, setStats]         = useState<Stats>(initStats);

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
            setArtworks(prev => prev.map(a => a.id === artworkId ? { ...a, saved: wasSaved } : a));
            setSaved(wasSaved
                ? prev => [{ id: target.id, title: target.title, artist: target.artist, medium: target.medium, price: target.price, image: target.image }, ...prev]
                : prev => prev.filter(a => a.id !== artworkId));
            setStats(initStats);
        }
    }, [artworks, initStats]);

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
                    <div className="hidden md:flex gap-2">
                        <Link href="/products" className="text-xs bg-amber-400 hover:bg-amber-500 text-neutral-900 font-semibold px-4 py-2 rounded-lg transition-colors">Browse All →</Link>
                        <Link href="/orders"   className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-colors">My Orders</Link>
                        <Link href="/cart"     className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-colors">My Cart</Link>
                    </div>
                </div>

                {/* Stats row 1 */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Gallery Artworks" value={stats.totalArtworks.toLocaleString()}  sub="Total in the gallery"          accent="bg-amber-400"   emoji="🖼️" />
                    <StatCard label="My Artworks"      value={stats.myArtworks.toLocaleString()}     sub="Uploaded by you"               accent="bg-sky-400"     emoji="✏️" />
                    <StatCard label="My Cart"          value={stats.myCartCount.toLocaleString()}    sub="Items in your cart"            accent="bg-emerald-400" emoji="🛒" />
                    <StatCard label="My Orders"        value={stats.myOrders.toLocaleString()}       sub={`${stats.myPendingOrders} pending`} accent="bg-rose-400" emoji="📦" />
                </div>

                {/* Stats row 2 */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Saved by You"     value={stats.savedCount.toLocaleString()}     sub="Your wishlist"                 accent="bg-rose-400"    emoji="❤️" />
                    <StatCard label="Live Exhibitions" value={stats.liveExhibitions.toLocaleString()} sub="Open for viewing"             accent="bg-purple-400"  emoji="🏛️" />
                    <StatCard label="My Revenue"       value={formatPrice(stats.myRevenue)}          sub="From your paid orders"         accent="bg-green-400"   emoji="💰" />
                    <StatCard label="Pending Orders"   value={stats.myPendingOrders.toLocaleString()} sub="Awaiting confirmation"        accent="bg-blue-400"    emoji="⏳" />
                </div>

                {/* Charts */}
                {analytics && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5">
                            <BarChart data={analytics.byCategory} title="My Artworks by Category" />
                        </div>
                        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5">
                            <BarChart data={analytics.byMedium} title="My Artworks by Medium" />
                        </div>
                        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5">
                            <BarChart data={analytics.byStatus} title="My Artworks by Status" />
                            <div className="mt-4 flex flex-wrap gap-2">
                                {analytics.byStatus.map((s, i) => (
                                    <span key={s.label} className={`text-xs font-semibold px-3 py-1 rounded-full text-white ${BAR_COLORS[i % BAR_COLORS.length]}`}>
                                        {s.label} ({s.count})
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Monthly + Top */}
                {analytics && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">My Artworks Added per Month</h3>
                            {analytics.monthlyArtworks.length === 0
                                ? <p className="text-sm text-neutral-400 text-center py-6">No data yet</p>
                                : <div className="flex items-end gap-2 h-32">
                                    {analytics.monthlyArtworks.map((m, i) => {
                                        const max = Math.max(...analytics.monthlyArtworks.map(x => x.count));
                                        const pct = Math.max(8, (m.count / max) * 100);
                                        return (
                                            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                                                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{m.count}</span>
                                                <div className={`w-full rounded-t-md ${BAR_COLORS[i % BAR_COLORS.length]}`} style={{ height: `${pct}%` }} />
                                                <span className="text-[10px] text-neutral-400 truncate w-full text-center">{m.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            }
                        </div>
                        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">My Top Artworks by Price</h3>
                            {analytics.topArtworks.length === 0
                                ? <p className="text-sm text-neutral-400 text-center py-6">No artworks yet</p>
                                : <div className="flex flex-col gap-3">
                                    {analytics.topArtworks.map((a, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${BAR_COLORS[i % BAR_COLORS.length]}`}>{i + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{a.title}</p>
                                                <p className="text-xs text-neutral-400">{a.artist}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold text-amber-500">{formatPrice(a.price)}</p>
                                                <span className={`text-[10px] font-semibold ${a.status === 'available' ? 'text-green-500' : 'text-neutral-400'}`}>{a.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }
                        </div>
                    </div>
                )}

                {/* Artworks + Saved */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Browse Artworks</h2>
                            <Link href="/products" className="text-xs text-amber-500 hover:underline">View all →</Link>
                        </div>
                        {artworks.length === 0
                            ? <div className="flex items-center justify-center h-40 text-neutral-400 text-sm">No artworks yet.</div>
                            : <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {artworks.map((artwork, i) => <ArtworkCard key={artwork.id} artwork={artwork} index={i} onToggleSave={handleToggleSave} />)}
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
                            : <div className="flex flex-col">{savedArtworks.map(a => <SavedRow key={a.id} artwork={a} onRemove={handleRemoveSaved} />)}</div>
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
                                    { name: 'Modern Visions 2024', curator: 'Maria Santos',    date: 'Mar 5 – Apr 2',   status: 'Active',   color: 'text-green-500 bg-green-50 dark:bg-green-900/20'  },
                                    { name: 'Echoes of the Earth', curator: 'Liam Reyes',      date: 'Apr 10 – May 15', status: 'Upcoming', color: 'text-sky-500 bg-sky-50 dark:bg-sky-900/20'        },
                                    { name: 'Fragments & Forms',   curator: 'Ana Villanueva',  date: 'May 20 – Jun 30', status: 'Planning', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'  },
                                    { name: 'Urban Pulse',         curator: 'Carlos Bautista', date: 'Jul 1 – Aug 10',  status: 'Planning', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'  },
                                ].map((ex) => (
                                    <tr key={ex.name} className="border-b border-neutral-50 dark:border-neutral-800/50 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="py-3 pr-4 font-medium text-neutral-800 dark:text-neutral-200">{ex.name}</td>
                                        <td className="py-3 pr-4 text-neutral-500">{ex.curator}</td>
                                        <td className="py-3 pr-4 text-neutral-500">{ex.date}</td>
                                        <td className="py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ex.color}`}>{ex.status}</span></td>
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