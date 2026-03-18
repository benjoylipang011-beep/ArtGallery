import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { PackageCheck, PackageOpen, Clock, Box, Truck, Home, XCircle, CheckCircle2, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Orders', href: '/orders' },
];

// ── Types ──────────────────────────────────────────────────────
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
    tracking_note?: string | null;
    confirmed_at?: string | null;
    shipped_at?: string | null;
    delivered_at?: string | null;
    items: OrderItem[];
}

interface Props {
    orders: Order[];
}

// ── Status badge styles ────────────────────────────────────────
const statusStyle: Record<string, string> = {
    pending:   'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30',
    confirmed: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
    shipped:   'bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30',
    delivered: 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30',
    cancelled: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30',
};

// ── Tracker config ─────────────────────────────────────────────
const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'] as const;

const STEP_META: Record<string, { label: string; Icon: React.ElementType }> = {
    pending:   { label: 'Order Placed', Icon: Clock   },
    confirmed: { label: 'Confirmed',    Icon: Box     },
    shipped:   { label: 'Shipped',      Icon: Truck   },
    delivered: { label: 'Delivered',    Icon: Home    },
};

function getTimestamp(order: Order, step: string): string | null {
    if (step === 'pending')   return order.created_at;
    if (step === 'confirmed') return order.confirmed_at ?? null;
    if (step === 'shipped')   return order.shipped_at ?? null;
    if (step === 'delivered') return order.delivered_at ?? null;
    return null;
}

function formatTs(ts: string | null): string {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Order Tracker Component ────────────────────────────────────
function OrderTracker({ order }: { order: Order }) {
    if (order.status === 'cancelled') {
        return (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg
                bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    This order has been cancelled.
                </p>
            </div>
        );
    }

    const currentIndex = STEPS.indexOf(order.status as typeof STEPS[number]);

    return (
        <div className="relative flex items-start justify-between gap-1">
            {/* Background connector line */}
            <div className="absolute left-4 right-4 top-4 h-[2px]
                bg-neutral-200 dark:bg-neutral-700 z-0" />

            {STEPS.map((step, i) => {
                const done   = currentIndex >= i;
                const active = currentIndex === i;
                const ts     = getTimestamp(order, step);
                const { label, Icon } = STEP_META[step];

                return (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                        {/* Circle */}
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all
                            ${done
                                ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 border-2 border-neutral-200 dark:border-neutral-700'}
                            ${active ? 'ring-2 ring-amber-400/40 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900' : ''}
                        `}>
                            {done && !active
                                ? <CheckCircle2 className="w-4 h-4" />
                                : <Icon className="w-4 h-4" />}
                        </div>

                        {/* Label */}
                        <p className={`text-[10px] font-semibold text-center leading-tight
                            ${active  ? 'text-amber-600 dark:text-amber-400' :
                              done    ? 'text-black dark:text-neutral-300' :
                                        'text-neutral-400 dark:text-neutral-500'}`}>
                            {label}
                        </p>

                        {/* Timestamp */}
                        {ts && done ? (
                            <p className="text-[9px] text-neutral-500 dark:text-neutral-400 text-center leading-tight">
                                {formatTs(ts)}
                            </p>
                        ) : (
                            <p className="text-[9px] text-neutral-300 dark:text-neutral-600 text-center">
                                {done ? '' : '—'}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────
export default function OrdersPage({ orders }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [confirmId, setConfirmId]   = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setDeletingId(id);
        router.delete(`/orders/${id}`, {
            onSuccess: () => { setConfirmId(null); setDeletingId(null); },
            onError:   () => setDeletingId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Orders" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 w-full">

                <div className="flex items-center gap-3">
                    <PackageCheck className="w-6 h-6 text-amber-500" />
                    <h1 className="text-2xl font-bold text-black dark:text-white">My Orders</h1>
                </div>

                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-black dark:text-white">
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
                            <div key={order.id} className="rounded-xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 overflow-hidden">

                                {/* Order header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                                    <div>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Order #{order.id}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
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
                                        {/* Delete button — only for delivered or cancelled */}
                                        {(order.status === 'delivered' || order.status === 'cancelled') && (
                                            <button
                                                onClick={() => setConfirmId(order.id)}
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800/40 transition-colors"
                                                title="Delete order"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* ── ORDER TRACKER ── */}
                                <div className="px-5 py-5 border-b border-neutral-100 dark:border-neutral-800">
                                    <OrderTracker order={order} />

                                    {/* Gallery note */}
                                    {order.tracking_note && (
                                        <div className="mt-4 flex gap-2 items-start px-3 py-2.5 rounded-lg
                                            bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                                            <span className="text-amber-500 text-sm mt-px">💬</span>
                                            <p className="text-xs text-amber-700 dark:text-amber-300 italic">
                                                "{order.tracking_note}"
                                            </p>
                                        </div>
                                    )}
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
                                                <p className="text-sm font-medium text-black dark:text-white truncate">{item.artwork.title}</p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.artwork.artist}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                                ₱{Number(item.price).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Delivery info */}
                                <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                                    <span>📦 {order.full_name} · {order.phone}</span>
                                    <span>📍 {order.address}</span>
                                    <span>💳 {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'GCash'}</span>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Delete confirmation modal ── */}
            {confirmId !== null && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-black dark:border-neutral-600 w-full max-w-sm p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-black dark:text-white">Delete Order?</h3>
                                <p className="text-sm text-black/50 dark:text-neutral-400">Order #{confirmId}</p>
                            </div>
                        </div>
                        <p className="text-sm text-black dark:text-neutral-300">
                            This will permanently remove the order from your history. This action cannot be undone.
                        </p>
                        <div className="flex gap-3 mt-1">
                            <button
                                onClick={() => setConfirmId(null)}
                                disabled={deletingId !== null}
                                className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-black dark:text-white font-medium py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(confirmId)}
                                disabled={deletingId !== null}
                                className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {deletingId !== null ? (
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                ) : <Trash2 className="w-4 h-4" />}
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}