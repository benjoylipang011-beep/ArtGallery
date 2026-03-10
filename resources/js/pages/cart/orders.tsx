import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { PackageCheck, PackageOpen } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Orders', href: '/orders' },
];

interface Artwork {
    id: number;
    title: string;
    artist: string;
    image: string | null;
}

interface OrderItem {
    id: number;
    price: string;
    artwork: Artwork;
}

interface Order {
    id: number;
    total: string;
    status: string;
    full_name: string;
    phone: string;
    address: string;
    payment_method: string;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    orders: Order[];
}

const statusStyle: Record<string, string> = {
    pending:   'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30',
    paid:      'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30',
    cancelled: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30',
};

export default function OrdersPage({ orders }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Orders" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 max-w-3xl mx-auto w-full">

                <div className="flex items-center gap-3">
                    <PackageCheck className="w-6 h-6 text-amber-500" />
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Orders</h1>
                </div>

                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-neutral-400">
                        <PackageOpen className="w-16 h-16 opacity-30" strokeWidth={1} />
                        <p className="text-lg font-medium">No orders yet</p>
                        <Link
                            href="/products"
                            className="mt-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
                        >
                            Browse Artworks
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {orders.map((order) => (
                            <div key={order.id} className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 overflow-hidden">

                                {/* Order header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                                    <div>
                                        <p className="text-xs text-neutral-400">Order #{order.id}</p>
                                        <p className="text-xs text-neutral-400 mt-0.5">
                                            {new Date(order.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                            ₱{Number(order.total).toLocaleString()}
                                        </span>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle[order.status] ?? statusStyle.pending}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Order items */}
                                <div className="px-5 py-4 flex flex-col gap-3">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-3 items-center">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                                                {item.artwork.image ? (
                                                    <img src={`/storage/${item.artwork.image}`} alt={item.artwork.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-amber-300 to-orange-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{item.artwork.title}</p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.artwork.artist}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                                ₱{Number(item.price).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Delivery info */}
                                <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                                    <span>📦 {order.full_name} · {order.phone}</span>
                                    <span>📍 {order.address}</span>
                                    <span>💳 {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'GCash'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}