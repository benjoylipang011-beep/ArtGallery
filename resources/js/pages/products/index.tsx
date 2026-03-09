import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Heart, Eye, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: '/products' },
    { title: 'All Artworks', href: '/products' },
];

interface Artwork {
    id: number;
    title: string;
    artist: string;
    medium: string | null;
    year: number | null;
    price: string | null;
    category: string | null;
    status: string;
    image: string | null;
    created_at: string;
}

const gradients = [
    'bg-gradient-to-br from-blue-400 to-blue-700',
    'bg-gradient-to-br from-amber-300 to-orange-500',
    'bg-gradient-to-br from-rose-300 to-pink-600',
    'bg-gradient-to-br from-neutral-500 to-neutral-800',
    'bg-gradient-to-br from-yellow-300 to-amber-600',
    'bg-gradient-to-br from-teal-300 to-cyan-700',
    'bg-gradient-to-br from-purple-400 to-pink-600',
    'bg-gradient-to-br from-green-400 to-emerald-700',
];

function ArtworkCard({ artwork, index }: { artwork: Artwork; index: number }) {
    const color = gradients[index % gradients.length];

    return (
        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 overflow-hidden flex flex-col hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="relative">
                {artwork.image ? (
                    <img
                        src={`/storage/${artwork.image}`}
                        alt={artwork.title}
                        className="h-48 w-full object-cover"
                    />
                ) : (
                    <div className={`h-48 ${color} flex items-end p-4`}>
                        <span className="text-white/70 text-xs font-mono">
                            {artwork.medium ?? 'Unknown'} · {artwork.year ?? '—'}
                        </span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors">
                        <Heart className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors">
                        <Eye className="w-5 h-5 text-white" />
                    </button>
                </div>
                {/* Status badge */}
                <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                    artwork.status === 'available' ? 'bg-green-500/80 text-white' :
                    artwork.status === 'sold' ? 'bg-red-500/80 text-white' :
                    artwork.status === 'reserved' ? 'bg-yellow-500/80 text-white' :
                    'bg-neutral-500/80 text-white'
                }`}>
                    {artwork.status}
                </span>
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-white text-sm leading-tight truncate">
                        {artwork.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{artwork.artist}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-xs text-neutral-400">{artwork.category ?? '—'}</span>
                    <span className="font-semibold text-sm text-amber-600 dark:text-amber-400">
                        {artwork.price ? `₱${Number(artwork.price).toLocaleString()}` : '—'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function ProductsIndex({ artworks }: { artworks: Artwork[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Artworks" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto rounded-xl p-4">

                {/* Header */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                            All Artworks
                        </h1>
                        <div className="flex items-center gap-2">
                            <select className="px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white">
                                <option>All Categories</option>
                                <option>Painting</option>
                                <option>Sculpture</option>
                                <option>Digital</option>
                                <option>Mixed Media</option>
                            </select>
                            <Link
                                href="/products/create"
                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Artwork
                            </Link>
                        </div>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Showing <span className="font-semibold">{artworks.length}</span> artworks
                    </p>
                </div>

                {/* Search Bar */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search artworks by title, artist, or medium..."
                        className="flex-1 px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                    />
                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors">
                        Search
                    </button>
                </div>

                {/* Artworks Grid */}
                {artworks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                        <p className="text-lg font-medium">No artworks yet</p>
                        <p className="text-sm mt-1">Click "Add Artwork" to add your first piece.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {artworks.map((artwork, index) => (
                            <ArtworkCard key={artwork.id} artwork={artwork} index={index} />
                        ))}
                    </div>
                )}

            </div>
        </AppLayout>
    );
}