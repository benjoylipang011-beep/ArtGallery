import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { ShoppingCart, Trash2, ArrowRight, PackageOpen } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cart', href: '/cart' },
];

interface Artwork {
    id: number;
    title: string;
    artist: string;
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

    const handleRemove = (artworkId: number) => {
        setRemovingId(artworkId);
        router.delete(`/cart/${artworkId}`, {
            onFinish: () => setRemovingId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Cart" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 max-w-4xl mx-auto w-full">

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
                                <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
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
                                        <p className="font-semibold text-neutral-900 dark:text-white truncate">{item.artwork.title}</p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.artwork.artist}</p>
                                        <p className="mt-1 font-bold text-amber-600 dark:text-amber-400">
                                            {item.artwork.price ? `₱${Number(item.artwork.price).toLocaleString()}` : '—'}
                                        </p>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() => handleRemove(item.artwork_id)}
                                        disabled={removingId === item.artwork_id}
                                        className="shrink-0 p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Order summary */}
                        <div className="md:col-span-1">
                            <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5 sticky top-4">
                                <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">Order Summary</h2>

                                <div className="flex flex-col gap-2 text-sm">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                            <span className="truncate mr-2">{item.artwork.title}</span>
                                            <span className="shrink-0">{item.artwork.price ? `₱${Number(item.artwork.price).toLocaleString()}` : '—'}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between font-bold text-neutral-900 dark:text-white">
                                    <span>Total</span>
                                    <span className="text-amber-600 dark:text-amber-400">₱{Number(total).toLocaleString()}</span>
                                </div>

                                <Link
                                    href="/cart/checkout"
                                    className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="w-4 h-4" />
                                </Link>

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