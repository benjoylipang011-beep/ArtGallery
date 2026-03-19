import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { ArrowLeft, Trash2, Calendar, Ruler, Tag, Palette, User, FileText, ShoppingCart, PackageCheck, Clock, Phone, CreditCard, CheckCheck, Truck, Home, Zap, MapPin, XCircle } from 'lucide-react';



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

interface PendingOrder {
    id: number;
    status: string;
    buyer_name: string;
    phone: string;
    address: string;
    payment_method: string;
    total: string;
    created_at: string;
    cancellation_reason?: string | null;
    cancelled_at?: string | null;
}

interface Props {
    artwork: Artwork;
    authUserId: number;
    inCart: boolean;
    pendingOrder?: PendingOrder | null;
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

export default function ShowArtwork({ artwork, authUserId, inCart, pendingOrder }: Props) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting]               = useState(false);
    const [addingToCart, setAddingToCart]       = useState(false);
    const [accepting, setAccepting]             = useState(false);
    const [declining, setDeclining]             = useState(false);
    const [shipping, setShipping]               = useState(false);
    const [delivering, setDelivering]           = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const { auth } = usePage().props as any;
    const resolvedAuthId = authUserId ?? auth?.user?.id;
    const isOwner     = Number(artwork.user_id) === Number(resolvedAuthId);
    const isAvailable = artwork.status === 'available';
    const isReserved  = artwork.status === 'reserved';
    const gradient    = gradients[artwork.id % gradients.length];

    const handleAcceptOrder = () => {
        if (!pendingOrder) return;
        setAccepting(true);
        router.patch(`/orders/${pendingOrder.id}/accept`, {}, {
            onFinish: () => setAccepting(false),
        });
    };

    const handleDeclineOrder = () => {
        if (!pendingOrder) return;
        setDeclining(true);
        router.patch(`/orders/${pendingOrder.id}/decline`, {}, {
            onSuccess: () => setShowDeclineModal(false),
            onFinish:  () => setDeclining(false),
        });
    };

    const handleShipOrder = () => {
        if (!pendingOrder) return;
        setShipping(true);
        router.patch(`/orders/${pendingOrder.id}/ship`, {}, {
            onFinish: () => setShipping(false),
        });
    };

    const handleDeliverOrder = () => {
        if (!pendingOrder) return;
        setDelivering(true);
        router.patch(`/orders/${pendingOrder.id}/deliver`, {}, {
            onFinish: () => setDelivering(false),
        });
    };

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
        archived:  'bg-neutral-500/15 text-neutral-600 dark:text-neutral-400 border border-neutral-500/30',
    }[artwork.status] ?? 'bg-neutral-500/15 text-neutral-600 dark:text-neutral-400 border border-neutral-500/30';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={artwork.title} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">

                {/* Top bar */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/products"
                        className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
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
                        <div className="rounded-2xl overflow-hidden border border-black dark:border-neutral-600 shadow-sm">
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
                                <span className="text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                                    {artwork.category}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right — details */}
                    <div className="md:col-span-3 flex flex-col gap-5">

                        {/* Title & artist */}
                        <div>
                            <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight leading-tight">
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

                        {/* ── Order management panel — visible to owner only ── */}
                        {isOwner && isReserved && pendingOrder && (
                            <div className={`rounded-xl border-2 p-5 flex flex-col gap-4 ${
                                pendingOrder.status === 'pending'   ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10' :
                                pendingOrder.status === 'confirmed' ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' :
                                pendingOrder.status === 'shipped'   ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/10' :
                                'border-amber-400 bg-amber-50 dark:bg-amber-900/10'
                            }`}>
                                {/* Header */}
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                        pendingOrder.status === 'pending'   ? 'bg-amber-400' :
                                        pendingOrder.status === 'confirmed' ? 'bg-blue-500' :
                                        'bg-violet-500'
                                    }`}>
                                        {pendingOrder.status === 'shipped'
                                            ? <Truck className="w-4 h-4 text-white" />
                                            : <PackageCheck className="w-4 h-4 text-white" />}
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm ${
                                            pendingOrder.status === 'pending'   ? 'text-amber-700 dark:text-amber-400' :
                                            pendingOrder.status === 'confirmed' ? 'text-blue-700 dark:text-blue-400' :
                                            'text-violet-700 dark:text-violet-400'
                                        }`}>
                                            {pendingOrder.status === 'pending'   ? 'New Order Received!' :
                                             pendingOrder.status === 'confirmed' ? 'Order Confirmed — Ready to Ship' :
                                             'Order Shipped — Mark as Delivered?'}
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Order #{pendingOrder.id} · {new Date(pendingOrder.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <span className="ml-auto text-lg font-bold text-black dark:text-white">
                                        ₱{Number(pendingOrder.total).toLocaleString()}
                                    </span>
                                </div>

                                {/* Buyer details */}
                                <div className="rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 flex flex-col gap-2">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1">Buyer Details</p>
                                    <div className="flex items-center gap-2 text-sm text-black dark:text-white">
                                        <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                        <span className="font-medium">{pendingOrder.buyer_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                                        <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                        <span>{pendingOrder.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                        <span>{pendingOrder.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                                        <CreditCard className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                        <span>{pendingOrder.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'GCash'}</span>
                                    </div>
                                </div>

                                {/* ── Action buttons by status ── */}

                                {/* PENDING: Accept / Decline */}
                                {pendingOrder.status === 'pending' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleAcceptOrder}
                                            disabled={accepting}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
                                        >
                                            {accepting
                                                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                                : <CheckCheck className="w-4 h-4" />}
                                            Accept Order
                                        </button>
                                        <button
                                            onClick={() => setShowDeclineModal(true)}
                                            disabled={declining}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 disabled:opacity-60 text-red-600 dark:text-red-400 border border-red-500/30 font-semibold text-sm transition-colors"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                )}

                                {/* CONFIRMED: Mark as Shipped */}
                                {pendingOrder.status === 'confirmed' && (
                                    <button
                                        onClick={handleShipOrder}
                                        disabled={shipping}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
                                    >
                                        {shipping
                                            ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                            : <Truck className="w-4 h-4" />}
                                        Mark as Shipped
                                    </button>
                                )}

                                {/* SHIPPED: Mark as Delivered */}
                                {pendingOrder.status === 'shipped' && (
                                    <button
                                        onClick={handleDeliverOrder}
                                        disabled={delivering}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
                                    >
                                        {delivering
                                            ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                            : <Home className="w-4 h-4" />}
                                        Mark as Delivered
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Owner sees reserved with no active order (edge case) */}
                        {isOwner && isReserved && !pendingOrder && (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                                <Clock className="w-4 h-4 shrink-0" />
                                This artwork has a pending order.
                            </div>
                        )}

                        {/* Owner sees a cancelled order on this artwork */}
                        {isOwner && artwork.status === 'available' && pendingOrder && pendingOrder.status === 'cancelled' && (
                            <div className="rounded-xl border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10 p-5 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                                        <XCircle className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-red-700 dark:text-red-400">Order Cancelled by Buyer</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Order #{pendingOrder.id} · {pendingOrder.cancelled_at
                                                ? new Date(pendingOrder.cancelled_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                                                : new Date(pendingOrder.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-white dark:bg-neutral-800 border border-red-200 dark:border-red-800/40 p-4 flex flex-col gap-2">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1">Buyer</p>
                                    <div className="flex items-center gap-2 text-sm text-black dark:text-white">
                                        <User className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                        <span className="font-medium">{pendingOrder.buyer_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                                        <Phone className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                        <span>{pendingOrder.phone}</span>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-white dark:bg-neutral-800 border border-red-200 dark:border-red-800/40 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1">Cancellation Reason</p>
                                    <p className="text-sm text-red-600 dark:text-red-400 italic">
                                        {pendingOrder.cancellation_reason ?? 'No reason provided'}
                                    </p>
                                </div>
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
                            <div className="px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-sm font-medium text-center">
                                This artwork is no longer available
                            </div>
                        )}

                        {/* Description */}
                        {artwork.description && (
                            <div className="rounded-xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 p-5">
                                <h2 className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white mb-2 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> Description
                                </h2>
                                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                    {artwork.description}
                                </p>
                            </div>
                        )}

                        {/* Details grid */}
                        <div className="rounded-xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 p-5">
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white mb-4">Artwork Details</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {artwork.medium && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                            <Palette className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Medium</p>
                                            <p className="text-sm font-medium text-black dark:text-white mt-0.5">{artwork.medium}</p>
                                        </div>
                                    </div>
                                )}
                                {artwork.year && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Year</p>
                                            <p className="text-sm font-medium text-black dark:text-white mt-0.5">{artwork.year}</p>
                                        </div>
                                    </div>
                                )}
                                {artwork.dimensions && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                            <Ruler className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Dimensions</p>
                                            <p className="text-sm font-medium text-black dark:text-white mt-0.5">{artwork.dimensions}</p>
                                        </div>
                                    </div>
                                )}
                                {artwork.category && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                            <Tag className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Category</p>
                                            <p className="text-sm font-medium text-black dark:text-white mt-0.5">{artwork.category}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Added on */}
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                            Added on {new Date(artwork.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Delete confirmation modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-black dark:border-neutral-600 w-full max-w-sm p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-black dark:text-white">Delete Artwork</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-black dark:text-neutral-300">
                            Are you sure you want to delete <span className="font-semibold">"{artwork.title}"</span>? It will be permanently removed from the gallery.
                        </p>
                        <div className="flex gap-3 mt-1">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleting}
                                className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-black dark:text-white font-medium py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
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

            {/* ── Decline confirmation modal ── */}
            {showDeclineModal && pendingOrder && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-black dark:border-neutral-600 w-full max-w-sm p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-black dark:text-white">Decline Order?</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Order #{pendingOrder.id}</p>
                            </div>
                        </div>
                        <p className="text-sm text-black dark:text-neutral-300">
                            Declining will cancel this order and mark the artwork as <span className="font-semibold">available</span> again.
                        </p>
                        <div className="flex gap-3 mt-1">
                            <button
                                onClick={() => setShowDeclineModal(false)}
                                disabled={declining}
                                className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-black dark:text-white font-medium py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeclineOrder}
                                disabled={declining}
                                className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {declining ? (
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                ) : null}
                                Yes, Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}