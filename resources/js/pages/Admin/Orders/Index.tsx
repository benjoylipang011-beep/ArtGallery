import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import {
    Package, ChevronDown, ChevronUp, CheckCircle2, Clock,
    Truck, Box, Home, XCircle, User, MapPin, Phone, CreditCard,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────
interface TimelineStep {
    key: string;
    label: string;
    done: boolean;
    active: boolean;
    timestamp: string | null;
}

interface OrderItem {
    price: number;
    artwork: string | null;
}

interface Order {
    id: number;
    user: string | null;
    email: string | null;
    total: number;
    status: string;
    full_name: string;
    phone: string;
    address: string;
    payment_method: string;
    tracking_note: string | null;
    created_at: string;
    timeline: TimelineStep[];
    items: OrderItem[];
}

// ── Config ─────────────────────────────────────────────────────
const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
    pending:   { color: 'text-amber-400',   bg: 'bg-amber-400/10',  border: 'border-amber-400/30'  },
    confirmed: { color: 'text-blue-400',    bg: 'bg-blue-400/10',   border: 'border-blue-400/30'   },
    shipped:   { color: 'text-violet-400',  bg: 'bg-violet-400/10', border: 'border-violet-400/30' },
    delivered: { color: 'text-emerald-400', bg: 'bg-emerald-400/10',border: 'border-emerald-400/30'},
    cancelled: { color: 'text-red-400',     bg: 'bg-red-400/10',    border: 'border-red-400/30'    },
};

const STEP_ICONS: Record<string, React.ElementType> = {
    pending: Clock, confirmed: Box, shipped: Truck, delivered: Home,
};

// ── Mini tracker ───────────────────────────────────────────────
function MiniTracker({ timeline, cancelled }: { timeline: TimelineStep[]; cancelled: boolean }) {
    if (cancelled) return (
        <div className="flex items-center gap-2 text-red-400 text-xs">
            <XCircle size={13} /> Cancelled
        </div>
    );
    return (
        <div className="flex items-center gap-1">
            {timeline.map((step, i) => {
                const Icon = STEP_ICONS[step.key] ?? Clock;
                return (
                    <div key={step.key} className="flex items-center gap-1">
                        <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center
                            ${step.done ? 'bg-amber-400 text-black' : 'bg-white/[0.05] text-white/15'}
                            ${step.active ? 'ring-2 ring-amber-400/40' : ''}
                        `}>
                            {step.done && !step.active
                                ? <CheckCircle2 size={12} />
                                : <Icon size={11} />}
                        </div>
                        {i < timeline.length - 1 && (
                            <div className={`w-5 h-[2px] ${step.done ? 'bg-amber-400/50' : 'bg-white/[0.06]'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Update Status Form ─────────────────────────────────────────
function UpdateStatusForm({ order, onDone }: { order: Order; onDone: () => void }) {
    const [status, setStatus] = useState(order.status);
    const [note, setNote]     = useState(order.tracking_note ?? '');
    const [loading, setLoading] = useState(false);

    const submit = () => {
        setLoading(true);
        router.patch(`/admin/orders/${order.id}/status`, { status, note }, {
            preserveScroll: true,
            onFinish: () => { setLoading(false); onDone(); },
        });
    };

    return (
        <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Update Status</p>

            <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(s => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                        <button key={s}
                            onClick={() => setStatus(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                                ${status === s
                                    ? `${cfg.color} ${cfg.bg} ${cfg.border}`
                                    : 'text-white/30 bg-white/[0.03] border-white/10 hover:border-white/20'}`}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    );
                })}
            </div>

            <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note for the customer (optional)…"
                rows={2}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2
                    text-sm text-white/60 placeholder-white/20 resize-none
                    focus:outline-none focus:border-amber-400/40 transition-colors"
            />

            <div className="flex gap-2 justify-end">
                <button onClick={onDone}
                    className="px-4 py-1.5 rounded-full text-xs text-white/30 hover:text-white/60 transition-colors">
                    Cancel
                </button>
                <button onClick={submit} disabled={loading}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-400 text-black
                        hover:bg-amber-300 transition-colors disabled:opacity-50">
                    {loading ? 'Saving…' : 'Save'}
                </button>
            </div>
        </div>
    );
}

// ── Admin Order Card ───────────────────────────────────────────
function AdminOrderCard({ order }: { order: Order }) {
    const [expanded, setExpanded]     = useState(false);
    const [showForm, setShowForm]     = useState(false);
    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

    return (
        <div className="rounded-2xl bg-neutral-900 border border-white/[0.06] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-white/40 font-mono font-bold">#{order.id}</span>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <div className="flex items-center gap-1.5 text-white/40">
                        <User size={12} />
                        <span className="text-xs">{order.user ?? 'Guest'}</span>
                    </div>
                    <span className="text-xs text-white/20">{order.created_at}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">₱{Number(order.total).toLocaleString()}</span>
                    <button onClick={() => setExpanded(!expanded)} className="text-white/30 hover:text-white/60 transition-colors">
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {/* Tracker row */}
            <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-4">
                <MiniTracker timeline={order.timeline} cancelled={order.status === 'cancelled'} />
                <button
                    onClick={() => { setShowForm(!showForm); setExpanded(true); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-amber-400/30
                        text-amber-400 hover:bg-amber-400/10 transition-colors font-medium">
                    Update Status
                </button>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="px-5 pb-5 border-t border-white/[0.05] pt-4 space-y-4">
                    {/* Items */}
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/25 mb-2">Items</p>
                        <div className="space-y-1.5">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-white/50">{item.artwork ?? 'Artwork'}</span>
                                    <span className="text-white/40">₱{Number(item.price).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex gap-2 items-start">
                            <MapPin size={13} className="text-white/25 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-white/25 mb-0.5">Address</p>
                                <p className="text-xs text-white/50">{order.address}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-start">
                            <Phone size={13} className="text-white/25 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-white/25 mb-0.5">Contact</p>
                                <p className="text-xs text-white/50">{order.full_name} · {order.phone}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-start">
                            <CreditCard size={13} className="text-white/25 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-white/25 mb-0.5">Payment</p>
                                <p className="text-xs text-white/50 capitalize">{order.payment_method.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>

                    {order.tracking_note && (
                        <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] px-3 py-2.5">
                            <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1">Current Note</p>
                            <p className="text-xs text-white/40 italic">"{order.tracking_note}"</p>
                        </div>
                    )}

                    {showForm && (
                        <UpdateStatusForm order={order} onDone={() => setShowForm(false)} />
                    )}
                </div>
            )}
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────
export default function AdminOrdersIndex({ orders }: { orders: Order[] }) {
    const counts = STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = orders.filter(o => o.status === s).length;
        return acc;
    }, {} as Record<string, number>);

    const [filter, setFilter] = useState<string>('all');
    const visible = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    return (
        <AppLayout>
            <Head title="Manage Orders" />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Order Management</h1>
                    <p className="text-sm text-white/35 mt-1">Update and track all customer orders</p>
                </div>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                            ${filter === 'all'
                                ? 'bg-white/10 text-white border-white/20'
                                : 'text-white/30 border-white/10 hover:border-white/20'}`}>
                        All ({orders.length})
                    </button>
                    {STATUS_OPTIONS.map(s => {
                        const cfg = STATUS_CONFIG[s];
                        return (
                            <button key={s} onClick={() => setFilter(s)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                                    ${filter === s
                                        ? `${cfg.color} ${cfg.bg} ${cfg.border}`
                                        : 'text-white/30 border-white/10 hover:border-white/20'}`}>
                                {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
                            </button>
                        );
                    })}
                </div>

                {visible.length === 0 ? (
                    <div className="text-center py-20 text-white/20">
                        <Package size={40} strokeWidth={1} className="mx-auto mb-3" />
                        <p className="text-sm">No orders found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {visible.map(order => <AdminOrderCard key={order.id} order={order} />)}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}