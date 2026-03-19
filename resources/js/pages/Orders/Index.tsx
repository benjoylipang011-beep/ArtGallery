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
    cancelled_at?: string | null;
    cancellation_reason?: string | null;
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
            <div className="flex flex-col gap-2 px-4 py-3 rounded-lg
                bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <div className="flex items-center gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
                        This order has been cancelled.
                    </p>
                </div>
                {order.cancellation_reason !== undefined && (
                    <p className="text-xs text-red-600/70 dark:text-red-400/70 italic pl-7">
                        Reason: {order.cancellation_reason ?? 'No reason provided'}
                    </p>
                )}
                {order.cancelled_at && (
                    <p className="text-xs text-red-600/70 dark:text-red-400/70 pl-7">
                        Cancelled on: {new Date(order.cancelled_at).toLocaleDateString('en-PH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                )}
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
    const [deletingIds, setDeletingIds] = useState<number[]>([]);
    const [confirmDeleteIds, setConfirmDeleteIds] = useState<number[] | null>(null);
    const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
    const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelOption, setCancelOption] = useState<string>('');
    const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const eligibleForDeletion = (status: string) => status === 'delivered' || status === 'cancelled';

    const toggleSelect = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const eligibleIds = orders.filter(o => eligibleForDeletion(o.status)).map(o => o.id);
        if (e.target.checked) {
            setSelectedIds(eligibleIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedIds.length === 0) return;
        setConfirmDeleteIds(selectedIds);
    };

    const executeDelete = () => {
        if (!confirmDeleteIds) return;
        setDeletingIds(confirmDeleteIds);

        const deleteSequentially = (ids: number[]) => {
            if (ids.length === 0) {
                setDeletingIds([]);
                setConfirmDeleteIds(null);
                setSelectedIds([]);
                router.reload({ only: ['orders'] });
                return;
            }
            const [first, ...rest] = ids;
            router.delete(`/orders/${first}`, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => deleteSequentially(rest),
                onError: () => {
                    setDeletingIds([]);
                    setConfirmDeleteIds(null);
                },
            });
        };

        deleteSequentially(confirmDeleteIds);
    };

    const handleDeleteSingle = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmDeleteIds([id]);
    };

    const handleCancelOrder = () => {
        if (!cancellingOrder) return;
        setIsSubmittingCancel(true);
        const finalReason = cancelOption === 'Other' ? cancelReason : cancelOption;
        router.post(`/orders/${cancellingOrder.id}/cancel`, { reason: finalReason }, {
            onSuccess: () => {
                setCancellingOrder(null);
                setCancelReason('');
                setCancelOption('');
                setSelectedOrderForModal(null);
                setIsSubmittingCancel(false);
                router.reload({ only: ['orders'] });
            },
            onError: () => setIsSubmittingCancel(false),
        });
    };

    const cancelOptions = [
        'Changed my mind',
        'Found better price elsewhere',
        'Ordered by mistake',
        'Shipping too slow',
        'Other',
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Orders" />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-scale-in {
                    animation: scaleIn 0.25s ease-out forwards;
                }
            `}</style>

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PackageCheck className="w-6 h-6 text-amber-500" />
                        <h1 className="text-2xl font-bold text-black dark:text-white">My Orders</h1>
                    </div>
                    {orders.filter(o => eligibleForDeletion(o.status)).length > 0 && (
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === orders.filter(o => eligibleForDeletion(o.status)).length && selectedIds.length > 0}
                                    onChange={selectAll}
                                    className="w-4 h-4 text-amber-600 rounded border-neutral-300 dark:border-neutral-600"
                                />
                                <span>Select all</span>
                            </label>
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800/40 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Selected ({selectedIds.length})
                                </button>
                            )}
                        </div>
                    )}
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
                        {orders.map((order) => {
                            const canDelete = eligibleForDeletion(order.status);
                            return (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrderForModal(order)}
                                    className="rounded-xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative"
                                >
                                    {canDelete && (
                                        <div
                                            className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(order.id)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    toggleSelect(order.id, e as any);
                                                }}
                                                className="w-4 h-4 text-amber-600 rounded border-neutral-300 dark:border-neutral-600"
                                            />
                                        </div>
                                    )}
                                    <div className={canDelete ? 'pl-10' : ''}>
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
                                                {/* Individual delete button */}
                                                {canDelete && (
                                                    <button
                                                        onClick={(e) => handleDeleteSingle(order.id, e)}
                                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800/40 transition-colors"
                                                        title="Delete order"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order items */}
                                        <div className="px-5 py-4 flex flex-col gap-3">
                                            {order.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex gap-3 items-center p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                                                >
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

                                        {/* Delivery info footer */}
                                        <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                                            <span>📦 {order.full_name} · {order.phone}</span>
                                            <span>📍 {order.address}</span>
                                            <span>💳 {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'GCash'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Order detail modal ── */}
            {selectedOrderForModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-black dark:border-neutral-600 w-full max-w-md max-h-[90vh] flex flex-col animate-scale-in">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                            <h3 className="text-lg font-bold text-black dark:text-white">
                                Order #{selectedOrderForModal.id}
                            </h3>
                            <button
                                onClick={() => setSelectedOrderForModal(null)}
                                className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            {/* Items */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-black dark:text-white mb-3">Items</h4>
                                <div className="space-y-3">
                                    {selectedOrderForModal.items.map((item) => (
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
                            </div>

                            {/* Order progress */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-black dark:text-white mb-3">Order Progress</h4>
                                <OrderTracker order={selectedOrderForModal} />
                            </div>

                            {/* Customer details */}
                            <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-sm">
                                <p className="font-medium text-black dark:text-white mb-2">Customer</p>
                                <p className="text-neutral-600 dark:text-neutral-400">📦 {selectedOrderForModal.full_name} · {selectedOrderForModal.phone}</p>
                                <p className="text-neutral-600 dark:text-neutral-400">📍 {selectedOrderForModal.address}</p>
                                <p className="text-neutral-600 dark:text-neutral-400">💳 {selectedOrderForModal.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'GCash'}</p>
                            </div>

                            {/* Cancel button – only if not cancelled */}
                            {selectedOrderForModal.status !== 'cancelled' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setCancellingOrder(selectedOrderForModal);
                                            setCancelOption('');
                                            setCancelReason('');
                                        }}
                                        className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Cancel Order
                                    </button>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-3">
                                        Cancelling will remove the entire order.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Cancel reason modal ── */}
            {cancellingOrder && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-black dark:border-neutral-600 w-full max-w-md p-6 flex flex-col gap-4 animate-scale-in">
                        <h3 className="text-lg font-bold text-black dark:text-white">Cancel Order #{cancellingOrder.id}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Please tell us why you're cancelling this order:
                        </p>
                        <div className="space-y-2">
                            {cancelOptions.map((option) => (
                                <label key={option} className="flex items-center gap-2 text-sm text-black dark:text-white">
                                    <input
                                        type="radio"
                                        name="cancelReason"
                                        value={option}
                                        checked={cancelOption === option}
                                        onChange={(e) => setCancelOption(e.target.value)}
                                        className="w-4 h-4 text-amber-600"
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                        {cancelOption === 'Other' && (
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Please specify your reason..."
                                rows={3}
                                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-sm text-black dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent mt-2"
                            />
                        )}
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => setCancellingOrder(null)}
                                disabled={isSubmittingCancel}
                                className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-black dark:text-white font-medium py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={isSubmittingCancel || !cancelOption}
                                className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {isSubmittingCancel ? (
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                ) : null}
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete confirmation modal (bulk) ── */}
            {confirmDeleteIds && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-black dark:border-neutral-600 w-full max-w-sm p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-black dark:text-white">Delete {confirmDeleteIds.length} Order{confirmDeleteIds.length > 1 ? 's' : ''}?</h3>
                                <p className="text-sm text-black/50 dark:text-neutral-400">Order IDs: {confirmDeleteIds.join(', ')}</p>
                            </div>
                        </div>
                        <p className="text-sm text-black dark:text-neutral-300">
                            This will permanently remove these orders from your history. This action cannot be undone.
                        </p>
                        <div className="flex gap-3 mt-1">
                            <button
                                onClick={() => setConfirmDeleteIds(null)}
                                disabled={deletingIds.length > 0}
                                className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-black dark:text-white font-medium py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                disabled={deletingIds.length > 0}
                                className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {deletingIds.length > 0 ? (
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