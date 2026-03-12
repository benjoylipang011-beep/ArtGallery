import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { ShoppingCart, Trash2, ArrowRight, PackageOpen, Zap } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cart', href: '/cart' },
];

interface Artwork {
    id: number;
    title: string;
    artist: string;
    description: string | null;
    medium: string | null;
    year: number | null;
    price: string | null;
    image: string | null;
    status: string;
}

interface CartItem {
    id: number;
    artwork_id: number;
    artwork: Artwork;
}

interface Props {
    cartItems: CartItem[];
    total: number;
    cartCount: number;
}

export default function CartIndex({ cartItems, total }: Props) {
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [checkingOut, setCheckingOut] = useState(false);

    const selectedItems = cartItems.filter(i => selectedIds.has(i.artwork_id));
    const selectedTotal = selectedItems.reduce((sum, i) => sum + Number(i.artwork.price ?? 0), 0);
    const allSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;

    const toggleItem = (artworkId: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(artworkId) ? next.delete(artworkId) : next.add(artworkId);
            return next;
        });
    };

    const toggleAll = () => {
        setSelectedIds(allSelected ? new Set() : new Set(cartItems.map(i => i.artwork_id)));
    };

    const handleCheckout = () => {
        setCheckingOut(true);
        if (selectedItems.length === 1) {
            // Single item — use buy-now flow
            router.get('/cart/buy-now', { artwork_id: selectedItems[0].artwork_id }, {
                onFinish: () => setCheckingOut(false),
            });
        } else if (selectedItems.length > 1) {
            // Multiple selected — go to checkout with selected ids as query params
            router.get('/cart/checkout', {
                selected_ids: selectedItems.map(i => i.artwork_id),
            }, {
                onFinish: () => setCheckingOut(false),
            });
        } else {
            // Nothing selected — checkout all
            router.visit('/cart/checkout', {
                onFinish: () => setCheckingOut(false),
            });
        }
    };

    const handleRemove = (artworkId: number) => {
        setRemovingId(artworkId);
        router.delete(`/cart/${artworkId}`, {
            onFinish: () => setRemovingId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Cart" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 w-full">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-amber-500" />
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Cart</h1>
                    <span className="text-sm text-neutral-400">({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                </div>

                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-neutral-400">
                        <PackageOpen className="w-16 h-16 opacity-30" strokeWidth={1} />
                        <p className="text-lg font-medium">Your cart is empty</p>
                        <Link
                            href="/products"
                            className="mt-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
                        >
                            Browse Artworks
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">

                        {/* Cart items list */}
                        <div className="md:col-span-2 flex flex-col gap-3">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => toggleItem(item.artwork_id)}
                                    className={`flex gap-4 p-4 rounded-xl border-[3px] cursor-pointer transition-all duration-150 bg-white dark:bg-neutral-900 ${
                                        selectedIds.has(item.artwork_id)
                                            ? 'border-white dark:border-white shadow-[0_0_0_1px_rgba(255,255,255,0.15)] scale-[1.01]'
                                            : 'border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                                    }`}
                                >
                                    {/* Image */}
                                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                                        {item.artwork.image ? (
                                            <img
                                                src={`/storage/${item.artwork.image}`}
                                                alt={item.artwork.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-amber-300 to-orange-500" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-neutral-900 dark:text-white truncate">{item.artwork.title}</p>
                                            {selectedIds.has(item.artwork_id) && (
                                                <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 border border-white/30 text-white">
                                                    ✓ Selected
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.artwork.artist}</p>
                                        {(item.artwork.medium || item.artwork.year) && (
                                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                                                {[item.artwork.medium, item.artwork.year].filter(Boolean).join(' · ')}
                                            </p>
                                        )}
                                        {item.artwork.description && (
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                                                {item.artwork.description}
                                            </p>
                                        )}
                                        <p className="mt-1.5 font-bold text-amber-600 dark:text-amber-400">
                                            {item.artwork.price ? `₱${Number(item.artwork.price).toLocaleString()}` : '—'}
                                        </p>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemove(item.artwork_id); }}
                                        disabled={removingId === item.artwork_id}
                                        className="shrink-0 self-center p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                                        title="Remove from cart"
                                    >
                                        {removingId === item.artwork_id ? (
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                            </svg>
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Order summary */}
                        <div className="md:col-span-1">
                            <div className="rounded-xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sticky top-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-neutral-900 dark:text-white">Order Summary</h2>
                                    <button
                                        onClick={toggleAll}
                                        className="text-xs text-amber-500 hover:text-amber-600 font-medium transition-colors"
                                    >
                                        {allSelected ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2 text-sm">
                                    {cartItems.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleItem(item.artwork_id)}
                                            className={`flex justify-between transition-colors cursor-pointer rounded px-1 py-0.5 -mx-1 ${
                                                selectedIds.has(item.artwork_id)
                                                    ? 'text-white font-semibold'
                                                    : selectedIds.size > 0
                                                        ? 'text-neutral-500 dark:text-neutral-600 opacity-50'
                                                        : 'text-neutral-600 dark:text-neutral-400'
                                            }`}
                                        >
                                            <span className="truncate mr-2 flex items-center gap-1">
                                                {selectedIds.has(item.artwork_id)
                                                    ? <span className="text-amber-400 shrink-0">✓</span>
                                                    : <span className="w-3 shrink-0" />
                                                }
                                                {item.artwork.title}
                                            </span>
                                            <span className="shrink-0">{item.artwork.price ? `₱${Number(item.artwork.price).toLocaleString()}` : '—'}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between font-bold text-neutral-900 dark:text-white">
                                    <span>
                                        {selectedIds.size > 0 ? `Selected (${selectedIds.size})` : 'Total'}
                                    </span>
                                    <span className="text-amber-600 dark:text-amber-400">
                                        ₱{(selectedIds.size > 0 ? selectedTotal : Number(total)).toLocaleString()}
                                    </span>
                                </div>
                                {selectedIds.size > 0 && (
                                    <p className="text-xs text-neutral-400 mt-1 text-right">
                                        {selectedIds.size} of {cartItems.length} items selected
                                    </p>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    disabled={checkingOut}
                                    className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
                                >
                                    {checkingOut ? (
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                    ) : selectedItems.length === 1 ? (
                                        <><Zap className="w-4 h-4" /> Buy "{selectedItems[0].artwork.title}"</>
                                    ) : selectedItems.length > 1 ? (
                                        <><Zap className="w-4 h-4" /> Checkout {selectedItems.length} Items</>
                                    ) : (
                                        <>Proceed to Checkout <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>

                                <Link
                                    href="/products"
                                    className="mt-2 w-full flex items-center justify-center px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}