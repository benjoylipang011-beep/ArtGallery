import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { Heart, Eye, Plus, Trash2 } from 'lucide-react';

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
    user_id: number;
}

interface Props {
    artworks: Artwork[];
    authUserId: number;
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

// ── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({ artwork, onClose }: { artwork: Artwork; onClose: () => void }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/products/${artwork.id}`, {
            onSuccess: onClose,
            onError: () => setDeleting(false),
        });
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-sidebar-border/70 dark:border-sidebar-border w-full max-w-sm p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900 dark:text-white">Delete Artwork</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">This action cannot be undone.</p>
                    </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Are you sure you want to delete <span className="font-semibold">"{artwork.title}"</span>? It will be permanently removed from the gallery.
                </p>
                <div className="flex gap-3 mt-1">
                    <button
                        onClick={onClose}
                        disabled={deleting}
                        className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-medium py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {deleting ? (
                            <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Artwork card ──────────────────────────────────────────────────────────────
function ArtworkCard({ artwork, index, authUserId, onDeleteRequest }: {
    artwork: Artwork;
    index: number;
    authUserId: number;
    onDeleteRequest: (artwork: Artwork) => void;
}) {
    const color = gradients[index % gradients.length];
    const isOwner = artwork.user_id === authUserId;

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

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors">
                        <Heart className="w-5 h-5 text-white" />
                    </button>
                    <Link
                        href={`/products/${artwork.id}`}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                        title="View artwork"
                    >
                        <Eye className="w-5 h-5 text-white" />
                    </Link>
                    {isOwner && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDeleteRequest(artwork); }}
                            className="p-2 rounded-full bg-red-500/70 hover:bg-red-500/90 backdrop-blur-sm transition-colors"
                            title="Delete artwork"
                        >
                            <Trash2 className="w-5 h-5 text-white" />
                        </button>
                    )}
                </div>

                {/* Status badge */}
                <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                    artwork.status === 'available' ? 'bg-green-500/80 text-white' :
                    artwork.status === 'sold'      ? 'bg-red-500/80 text-white' :
                    artwork.status === 'reserved'  ? 'bg-yellow-500/80 text-white' :
                    'bg-neutral-500/80 text-white'
                }`}>
                    {artwork.status}
                </span>

                {/* Owner badge */}
                {isOwner && (
                    <span className="absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/80 text-white">
                        Yours
                    </span>
                )}
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProductsIndex({ artworks, authUserId }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<Artwork | null>(null);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');

    const categories = ['All Categories', ...Array.from(
        new Set(artworks.map((a) => a.category).filter(Boolean) as string[])
    ).sort()];

    const filtered = artworks.filter((a) => {
        const q = search.toLowerCase();
        const matchesSearch =
            !q ||
            a.title.toLowerCase().includes(q) ||
            a.artist.toLowerCase().includes(q) ||
            (a.medium ?? '').toLowerCase().includes(q);
        const matchesCategory =
            selectedCategory === 'All Categories' ||
            (a.category ?? '').toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Artworks" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">

                {/* Header */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                            All Artworks
                        </h1>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
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
                        Showing <span className="font-semibold">{filtered.length}</span>
                        {filtered.length !== artworks.length && (
                            <span> of <span className="font-semibold">{artworks.length}</span></span>
                        )} artworks
                        {(search || selectedCategory !== 'All Categories') && (
                            <button
                                onClick={() => { setSearch(''); setSelectedCategory('All Categories'); }}
                                className="ml-2 text-xs text-amber-600 hover:text-amber-700 underline underline-offset-2"
                            >
                                Clear filters
                            </button>
                        )}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none z-10 transition-colors group-focus-within:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search artworks..."
                            className="pl-9 pr-8 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-[width,border-color,box-shadow] duration-500 ease-in-out w-44 focus:w-96"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Artworks Grid */}
                {artworks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                        <p className="text-lg font-medium">No artworks yet</p>
                        <p className="text-sm mt-1">Click "Add Artwork" to add your first piece.</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                        <p className="text-lg font-medium">No results found</p>
                        <p className="text-sm mt-1">Try a different search term or category.</p>
                        <button
                            onClick={() => { setSearch(''); setSelectedCategory('All Categories'); }}
                            className="mt-3 text-sm text-amber-600 hover:text-amber-700 underline underline-offset-2"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((artwork, index) => (
                            <ArtworkCard
                                key={artwork.id}
                                artwork={artwork}
                                index={index}
                                authUserId={authUserId}
                                onDeleteRequest={setDeleteTarget}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete modal */}
            {deleteTarget && (
                <DeleteModal
                    artwork={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </AppLayout>
    );
}