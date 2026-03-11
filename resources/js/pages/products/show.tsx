import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { ArrowLeft, Trash2, Calendar, Ruler, Tag, Palette, User, FileText, ShoppingCart, Zap } from 'lucide-react';

interface Artwork {
    id: number;
    title: string;
    artist: string;
    description: string | null;
    medium: string | null;
    year: number | null;
    dimensions: string | null;
    price: string | null;
    category: string | null;
    status: string;
    image: string | null;
    created_at: string;
    user_id: number;
}

interface Props {
    artwork: Artwork;
    authUserId: number;
    inCart: boolean;
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

export default function ShowArtwork({ artwork, authUserId, inCart }: Props) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const { auth } = usePage().props as any;
    const resolvedAuthId = authUserId ?? auth?.user?.id;
    const isOwner = Number(artwork.user_id) === Number(resolvedAuthId);
    const isAvailable = artwork.status === 'available';
    const gradient = gradients[artwork.id % gradients.length];

    const handleAddToCart = () => {
        setAddingToCart(true);
        router.post('/cart', { artwork_id: artwork.id }, {
            onFinish: () => setAddingToCart(false),
        });
    };

    const handleBuyNow = () => {
        router.visit(`/cart/buy-now?artwork_id=${artwork.id}`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: '/products' },
        { title: 'All Artworks', href: '/products' },
        { title: artwork.title, href: `/products/${artwork.id}` },
    ];

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/products/${artwork.id}`, {
            onSuccess: () => router.visit('/products'),
            onError: () => setDeleting(false),
        });
    };

    const statusStyle = {
        available: 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30',
        sold:      'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30',
        reserved:  'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30',
        archived:  'bg-neutral-500/15 text-neutral-500 dark:text-neutral-400 border border-neutral-500/30',
    }[artwork.status] ?? 'bg-neutral-500/15 text-neutral-500 border border-neutral-500/30';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={artwork.title} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">

                {/* Top bar */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/products"
                        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to All Artworks
                    </Link>

                    {isOwner && (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Artwork
                        </button>
                    )}
                </div>

                {/* Main content */}
                <div className="grid gap-6 md:grid-cols-5">

                    {/* Left — image */}
                    <div className="md:col-span-2">
                        <div className="rounded-2xl overflow-hidden border-[3px] border-neutral-300 dark:border-neutral-800 shadow-sm">
                            {artwork.image ? (
                                <img
                                    src={`/storage/${artwork.image}`}
                                    alt={artwork.title}
                                    className="w-full object-cover"
                                />
                            ) : (
                                <div className={`${gradient} aspect-[4/3] flex items-end p-5`}>
                                    <span className="text-white/70 text-xs font-mono">
                                        {artwork.medium ?? 'Unknown'} · {artwork.year ?? '—'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Status badge below image */}
                        <div className="mt-3 flex items-center gap-2">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle}`}>
                                {artwork.status.charAt(0).toUpperCase() + artwork.status.slice(1)}
                            </span>
                            {artwork.category && (
                                <span className="text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                                    {artwork.category}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right — details */}
                    <div className="md:col-span-3 flex flex-col gap-5">

                        {/* Title & artist */}
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                                {artwork.title}
                            </h1>
                            <p className="mt-1 text-base text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                {artwork.artist}
                            </p>
                        </div>

                        {/* Price */}
                        {artwork.price && (
                            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl px-5 py-3 w-fit">
                                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">₱</span>
                                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                    {Number(artwork.price).toLocaleString()}
                                </span>
                            </div>
                        )}

                        {/* Buy / Cart buttons — only for non-owners */}
                        {!isOwner && isAvailable && (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors"
                                >
                                    <Zap className="w-4 h-4" />
                                    Buy Now
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || inCart}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-colors border ${
                                        inCart
                                            ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 cursor-default'
                                            : 'border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    } disabled:opacity-60`}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    {inCart ? 'In Cart' : addingToCart ? 'Adding...' : 'Add to Cart'}
                                </button>
                            </div>
                        )}

                        {!isOwner && !isAvailable && (
                            <div className="px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm font-medium text-center">
                                This artwork is no longer available
                            </div>
                        )}

                        {/* Description */}
                        {artwork.description && (
                            <div className="rounded-xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
                                <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> Description
                                </h2>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                    {artwork.description}
                                </p>
                            </div>
                        )}

                        {/* Details grid */}
                        <div className="rounded-xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">Artwork Details</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {artwork.medium && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                            <Palette className="w-4 h-4 text-neutral-500" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Medium</p>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white mt-0.5">{artwork.medium}</p>
                                        </div>
                                    </div>
                                )}
                                {artwork.year && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4 text-neutral-500" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Year</p>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white mt-0.5">{artwork.year}</p>
                                        </div>
                                    </div>
                                )}
                                {artwork.dimensions && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                            <Ruler className="w-4 h-4 text-neutral-500" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Dimensions</p>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white mt-0.5">{artwork.dimensions}</p>
                                        </div>
                                    </div>
                                )}
                                {artwork.category && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                            <Tag className="w-4 h-4 text-neutral-500" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Category</p>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white mt-0.5">{artwork.category}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Added on */}
                        <p className="text-xs text-neutral-400">
                            Added on {new Date(artwork.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Delete confirmation modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border-[3px] border-neutral-300 dark:border-neutral-800 w-full max-w-sm p-6 flex flex-col gap-4">
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
                                onClick={() => setShowDeleteModal(false)}
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
            )}
        </AppLayout>
    );
}