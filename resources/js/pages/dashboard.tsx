import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useCallback } from 'react';
import axios from 'axios';
import {
  Heart,
  Image as ImageIcon,
  PenTool,
  ShoppingCart,
  Package,
  Building2,
  Wallet,
  Clock,
  ChevronDown,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

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
  myArtworks: number;
  myOrders: number;
  myRevenue: number;
  myCartCount: number;
  myPendingOrders: number;
}
interface ChartItem {
  label: string;
  count: number;
}
interface TopArtwork {
  title: string;
  artist: string;
  price: number;
  status: string;
}
interface Analytics {
  byCategory: ChartItem[];
  byStatus: ChartItem[];
  byMedium: ChartItem[];
  topArtworks: TopArtwork[];
  monthlyArtworks: ChartItem[];
}

const GRADIENTS = [
  'bg-gradient-to-br from-blue-400 to-blue-700',
  'bg-gradient-to-br from-amber-300 to-orange-500',
  'bg-gradient-to-br from-rose-300 to-pink-600',
  'bg-gradient-to-br from-neutral-500 to-neutral-800',
  'bg-gradient-to-br from-yellow-300 to-amber-600',
  'bg-gradient-to-br from-teal-300 to-cyan-700',
];
const BAR_COLORS = [
  'bg-amber-400',
  'bg-rose-400',
  'bg-sky-400',
  'bg-emerald-400',
  'bg-purple-400',
  'bg-orange-400',
];

function formatPrice(price: number) {
  return '₱' + Number(price ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
}
function csrfToken(): string {
  return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

// StatCard with 3px silver border
function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-2">
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10 ${accent}`} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{label}</span>
        <span className="text-neutral-500">{icon}</span>
      </div>
      <span className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">{value}</span>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{sub}</span>
    </div>
  );
}

function BarChart({ data, title }: { data: ChartItem[]; title: string }) {
  if (!data || !data.length)
    return (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">{title}</h3>
        <p className="text-xs text-neutral-400 py-4 text-center">No data yet</p>
      </div>
    );
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">{title}</h3>
      <div className="flex flex-col gap-2">
        {data.map((item, i) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 w-24 truncate shrink-0">
              {item.label}
            </span>
            <div className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 w-6 text-right shrink-0">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PIE_COLORS = [
  '#f59e0b',
  '#f43f5e',
  '#38bdf8',
  '#34d399',
  '#a78bfa',
  '#fb923c',
  '#e879f9',
  '#4ade80',
];

function LineAreaChart({ data, title }: { data: ChartItem[]; title?: string }) {
  if (!data || !data.length)
    return (
      <div>
        {title && <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">{title}</h3>}
        <p className="text-xs text-neutral-400 py-4 text-center">No data yet</p>
      </div>
    );

  const W = 400,
    H = 140,
    PAD = { top: 20, right: 16, bottom: 32, left: 32 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max = Math.max(...data.map((d) => d.count), 1);
  const xStep = innerW / Math.max(data.length - 1, 1);

  const pts = data.map((d, i) => ({
    x: PAD.left + i * xStep,
    y: PAD.top + innerH - (d.count / max) * innerH,
    label: d.label,
    count: d.count,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${PAD.top + innerH} L${pts[0].x},${
    PAD.top + innerH
  } Z`;

  return (
    <div>
      {title && <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">{title}</h3>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.top + innerH * t;
          return (
            <g key={t}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                className="dark:stroke-neutral-800"
              />
              <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                {Math.round(max * (1 - t))}
              </text>
            </g>
          );
        })}
        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots + labels */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#f59e0b" stroke="white" strokeWidth="2" />
            <text x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
              {p.label.split(' ')[0]}
            </text>
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#d97706">
              {p.count}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function PieChart({ data, title }: { data: ChartItem[]; title?: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  if (!data || !data.length)
    return (
      <div>
        {title && <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">{title}</h3>}
        <p className="text-xs text-neutral-400 py-4 text-center">No data yet</p>
      </div>
    );

  const total = data.reduce((s, d) => s + d.count, 0);
  const cx = 80,
    cy = 80,
    r = 68,
    innerR = 36;
  let angle = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const pct = d.count / total;
    const startAngle = angle;
    angle += pct * 2 * Math.PI;
    const endAngle = angle;
    const x1 = cx + r * Math.cos(startAngle),
      y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle),
      y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle),
      iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle),
      iy2 = cy + innerR * Math.sin(startAngle);
    const large = pct > 0.5 ? 1 : 0;
    const midAngle = startAngle + pct * Math.PI;
    return {
      d: `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix1},${iy1} A${innerR},${innerR} 0 ${large},0 ${ix2},${iy2} Z`,
      color: PIE_COLORS[i % PIE_COLORS.length],
      label: d.label,
      count: d.count,
      pct: Math.round(pct * 100),
      midAngle,
      i,
    };
  });

  const hov = hovered !== null ? slices[hovered] : null;

  return (
    <div>
      {title && <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">{title}</h3>}
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 160 160" className="shrink-0" style={{ width: 140, height: 140 }}>
          {slices.map((s, i) => (
            <path
              key={i}
              d={s.d}
              fill={s.color}
              opacity={hovered === null || hovered === i ? 1 : 0.45}
              transform={hovered === i ? `translate(${Math.cos(s.midAngle) * 4},${Math.sin(s.midAngle) * 4})` : ''}
              style={{ transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          {hov ? (
            <>
              <text x={cx} y={cy - 7} textAnchor="middle" fontSize="18" fontWeight="800" fill={hov.color}>
                {hov.count}
              </text>
              <text x={cx} y={cy + 9} textAnchor="middle" fontSize="8" fill="#9ca3af">
                {hov.pct}%
              </text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 5} textAnchor="middle" fontSize="18" fontWeight="800" fill="#374151">
                {total}
              </text>
              <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#9ca3af">
                total
              </text>
            </>
          )}
        </svg>
        <div className="flex flex-col gap-1.5 min-w-0">
          {slices.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{s.label}</span>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 ml-auto pl-2">
                {s.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArtworkCard({
  artwork,
  index,
  onToggleSave,
}: {
  artwork: Artwork;
  index: number;
  onToggleSave: (id: number) => void;
}) {
  const grad = GRADIENTS[index % GRADIENTS.length];
  return (
    <div className="rounded-xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
      <div className={`h-44 relative flex items-end justify-between p-3 ${!artwork.image ? grad : ''}`}>
        {artwork.image && (
          <img
            src={artwork.image}
            alt={artwork.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <span className="relative z-10 text-white/80 text-xs font-mono drop-shadow">
          {artwork.medium} · {artwork.year}
        </span>
        <span
          className={`relative z-10 text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${
            artwork.status === 'available'
              ? 'bg-white/20 text-white'
              : 'bg-black/30 text-white/60'
          }`}
        >
          {artwork.status === 'available' ? 'Available' : 'Sold'}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <p className="font-semibold text-neutral-900 dark:text-white text-sm leading-tight truncate">
          {artwork.title}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{artwork.artist}</p>
        {artwork.category && (
          <span className="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full w-fit">
            {artwork.category}
          </span>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-amber-500">{formatPrice(artwork.price)}</span>
          <button
            onClick={() => onToggleSave(artwork.id)}
            className={`transition-all duration-150 select-none ${
              artwork.saved ? 'text-rose-500' : 'text-neutral-300 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${artwork.saved ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SavedRow({ artwork, onRemove }: { artwork: SavedArtwork; onRemove: (id: number) => void }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      {artwork.image ? (
        <img
          src={artwork.image}
          alt={artwork.title}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-200 to-amber-500 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{artwork.title}</p>
        <p className="text-xs text-neutral-400">
          {artwork.artist} · {artwork.medium}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-amber-500">{formatPrice(artwork.price)}</p>
        <button
          onClick={() => onRemove(artwork.id)}
          className="text-xs text-neutral-400 hover:text-rose-400 transition-colors mt-0.5"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const page = usePage();
  const rawProps = page.props as Record<string, unknown>;

  const initArtworks: Artwork[] = Array.isArray(rawProps.artworks) ? (rawProps.artworks as Artwork[]) : [];
  const initSaved: SavedArtwork[] = Array.isArray(rawProps.savedArtworks)
    ? (rawProps.savedArtworks as SavedArtwork[])
    : [];
  const rawStats = (rawProps.stats && typeof rawProps.stats === 'object') ? (rawProps.stats as Partial<Stats>) : {};
  const analytics = (rawProps.analytics && typeof rawProps.analytics === 'object')
    ? (rawProps.analytics as Analytics)
    : null;

  const initStats: Stats = {
    totalArtworks: Number(rawStats.totalArtworks ?? 0),
    savedCount: Number(rawStats.savedCount ?? 0),
    liveExhibitions: Number(rawStats.liveExhibitions ?? 0),
    myArtworks: Number(rawStats.myArtworks ?? 0),
    myOrders: Number(rawStats.myOrders ?? 0),
    myRevenue: Number(rawStats.myRevenue ?? 0),
    myCartCount: Number(rawStats.myCartCount ?? 0),
    myPendingOrders: Number(rawStats.myPendingOrders ?? 0),
  };

  const [artworks, setArtworks] = useState<Artwork[]>(initArtworks);
  const [savedArtworks, setSaved] = useState<SavedArtwork[]>(initSaved);
  const [stats, setStats] = useState<Stats>(initStats);

  const handleToggleSave = useCallback(
    async (artworkId: number) => {
      const target = artworks.find((a) => a.id === artworkId);
      if (!target) return;
      const wasSaved = target.saved;
      setArtworks((prev) => prev.map((a) => (a.id === artworkId ? { ...a, saved: !a.saved } : a)));
      if (wasSaved) {
        setSaved((prev) => prev.filter((a) => a.id !== artworkId));
        setStats((prev) => ({ ...prev, savedCount: Math.max(0, prev.savedCount - 1) }));
      } else {
        setSaved((prev) => [
          {
            id: target.id,
            title: target.title,
            artist: target.artist,
            medium: target.medium,
            price: target.price,
            image: target.image,
          },
          ...prev,
        ]);
        setStats((prev) => ({ ...prev, savedCount: prev.savedCount + 1 }));
      }
      try {
        const res = await axios.post(`/artworks/${artworkId}/save`, {}, { headers: { 'X-CSRF-TOKEN': csrfToken() } });
        setStats((prev) => ({ ...prev, savedCount: res.data.savedCount }));
      } catch {
        setArtworks((prev) => prev.map((a) => (a.id === artworkId ? { ...a, saved: wasSaved } : a)));
        setSaved(wasSaved
          ? (prev) => [
              { id: target.id, title: target.title, artist: target.artist, medium: target.medium, price: target.price, image: target.image },
              ...prev,
            ]
          : (prev) => prev.filter((a) => a.id !== artworkId)
        );
        setStats(initStats);
      }
    },
    [artworks, initStats]
  );

  const handleRemoveSaved = useCallback(
    async (artworkId: number) => {
      setSaved((prev) => prev.filter((a) => a.id !== artworkId));
      setArtworks((prev) => prev.map((a) => (a.id === artworkId ? { ...a, saved: false } : a)));
      setStats((prev) => ({ ...prev, savedCount: Math.max(0, prev.savedCount - 1) }));
      try {
        const res = await axios.delete(`/artworks/${artworkId}/save`, { headers: { 'X-CSRF-TOKEN': csrfToken() } });
        setStats((prev) => ({ ...prev, savedCount: res.data.savedCount }));
      } catch {
        /* silent */
      }
    },
    []
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
        {/* Welcome Banner (no border) */}
        <div className="rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700 dark:from-neutral-800 dark:to-neutral-900 p-6 flex items-center justify-between">
          <div>
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">Welcome back</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">Discover Art You'll Love</h1>
            <p className="text-neutral-400 text-sm mt-1">Explore curated artworks and upcoming exhibitions.</p>
          </div>
          <div className="hidden md:flex gap-2">
            <Link
              href="/products"
              className="text-xs bg-amber-400 hover:bg-amber-500 text-neutral-900 font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Browse All →
            </Link>
            <Link
              href="/orders"
              className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              My Orders
            </Link>
            <Link
              href="/cart"
              className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              My Cart
            </Link>
          </div>
        </div>

        {/* Stats Row 1 – Core metrics */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Gallery Artworks"
            value={stats.totalArtworks.toLocaleString()}
            sub="Total in the gallery"
            accent="bg-amber-400"
            icon={<ImageIcon className="w-5 h-5" />}
          />
          <StatCard
            label="My Artworks"
            value={stats.myArtworks.toLocaleString()}
            sub="Uploaded by you"
            accent="bg-sky-400"
            icon={<PenTool className="w-5 h-5" />}
          />
          <StatCard
            label="My Cart"
            value={stats.myCartCount.toLocaleString()}
            sub="Items in your cart"
            accent="bg-emerald-400"
            icon={<ShoppingCart className="w-5 h-5" />}
          />
          <StatCard
            label="My Orders"
            value={stats.myOrders.toLocaleString()}
            sub={`${stats.myPendingOrders} pending`}
            accent="bg-rose-400"
            icon={<Package className="w-5 h-5" />}
          />
        </div>

        {/* Stats Row 2 – Secondary metrics */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Saved by You"
            value={stats.savedCount.toLocaleString()}
            sub="Your wishlist"
            accent="bg-rose-400"
            icon={<Heart className="w-5 h-5 fill-rose-500 text-rose-500" />}
          />
          <StatCard
            label="Live Exhibitions"
            value={stats.liveExhibitions.toLocaleString()}
            sub="Open for viewing"
            accent="bg-purple-400"
            icon={<Building2 className="w-5 h-5" />}
          />
          <StatCard
            label="My Revenue"
            value={formatPrice(stats.myRevenue)}
            sub="From your paid orders"
            accent="bg-green-400"
            icon={<Wallet className="w-5 h-5" />}
          />
          <StatCard
            label="Pending Orders"
            value={stats.myPendingOrders.toLocaleString()}
            sub="Awaiting confirmation"
            accent="bg-blue-400"
            icon={<Clock className="w-5 h-5" />}
          />
        </div>

        {/* PRIMARY ANALYTICS – Monthly Added & Status Distribution */}
        {analytics && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* My Artworks Added per Month */}
            <div className="rounded-xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white p-5 dark:bg-neutral-900">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                My Artworks Added per Month
              </h3>
              <LineAreaChart data={analytics.monthlyArtworks} />
            </div>

            {/* Artworks by Status */}
            <div className="rounded-xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white p-5 dark:bg-neutral-900">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Artworks by Status
              </h3>
              <PieChart data={analytics.byStatus} />
            </div>
          </div>
        )}

        {/* SECONDARY ANALYTICS – Category & Medium (collapsible) */}
        {analytics && (
          <details className="group rounded-xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-sm font-medium text-neutral-600 dark:text-neutral-300">
              <span>More analytics (Category & Medium)</span>
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid gap-6 p-5 pt-0 md:grid-cols-2">
              <BarChart data={analytics.byCategory} title="By Category" />
              <BarChart data={analytics.byMedium} title="By Medium" />
            </div>
          </details>
        )}

        {/* Top Artworks */}
        {analytics && analytics.topArtworks.length > 0 && (
          <div className="rounded-xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white p-5 dark:bg-neutral-900">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              My Top 5 Artworks by Price
            </h3>
            <div className="flex flex-col gap-3">
              {analytics.topArtworks.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                      BAR_COLORS[i % BAR_COLORS.length]
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{a.title}</p>
                    <p className="text-xs text-neutral-400">{a.artist}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-amber-500">{formatPrice(a.price)}</p>
                    <span
                      className={`text-[10px] font-semibold ${
                        a.status === 'available' ? 'text-green-500' : 'text-neutral-400'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artworks Grid & Saved Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Browse Artworks */}
          <div className="md:col-span-2 rounded-xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white p-5 dark:bg-neutral-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Browse Artworks
              </h2>
              <Link href="/products" className="text-xs text-amber-500 hover:underline">
                View all →
              </Link>
            </div>
            {artworks.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-neutral-400 text-sm">No artworks yet.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {artworks.slice(0, 3).map((artwork, i) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} index={i} onToggleSave={handleToggleSave} />
                ))}
              </div>
            )}
          </div>

          {/* Saved Artworks */}
          <div className="rounded-xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white p-5 dark:bg-neutral-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Saved Artworks
              </h2>
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                {stats.savedCount}
              </span>
            </div>
            {savedArtworks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <Heart className="w-8 h-8 text-neutral-200 dark:text-neutral-700" />
                <p className="text-xs text-neutral-400 text-center">
                  Tap ♡ on any artwork
                  <br />
                  to save it here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {savedArtworks.map((a) => (
                  <SavedRow key={a.id} artwork={a} onRemove={handleRemoveSaved} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Exhibitions Table */}
        <div className="rounded-xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Exhibitions
            </h2>
            <a href="#" className="text-xs text-amber-500 hover:underline">
              View all →
            </a>
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
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ex.color}`}>
                        {ex.status}
                      </span>
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