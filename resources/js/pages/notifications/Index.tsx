import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, ShoppingBag, Package, Info, BellOff, BellRing, XCircle, Loader2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notifications', href: '/notifications' },
];

interface NotificationData {
    type?: string;
    message: string;
    action_url?: string;
    buyer_name?: string;
    artwork?: string;
    reason?: string; // added for cancellation reason
}

interface Notification {
    id: string;
    type: string;
    data: NotificationData;
    read_at: string | null;
    human_time: string;
    created_at: string;
}

interface Props {
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const DOT_COLORS: Record<string, string> = {
    artwork_sold:   'bg-green-500',
    artist_joined:  'bg-blue-500',
    exhibition:     'bg-red-500',
    comment:        'bg-gray-500',
    order_cancelled: 'bg-red-500',
    default:        'bg-amber-500',
};

const TYPE_ICONS: Record<string, React.ElementType> = {
    artwork_sold:   ShoppingBag,
    artist_joined:  Package,
    order_cancelled: XCircle,
    default:        Info,
};

// ── CSRF token helper ─────────────────────────────────────────
function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

function apiFetch(method: string, url: string): Promise<Response> {
    return fetch(url, {
        method,
        headers: {
            'Accept':           'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN':     xsrfToken(),
        },
    });
}

export default function NotificationsIndex({ notifications }: Props) {
    const [items, setItems]        = useState<Notification[]>(notifications.data);
    const [unreadCount, setUnread] = useState(() => notifications.data.filter(n => !n.read_at).length);
    const [loading, setLoading]    = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

    const allRead = items.length > 0 && items.every(n => n.read_at !== null);

    // ── Sync sidebar badge ────────────────────────────────────
    useEffect(() => {
        localStorage.setItem('notif_unread_count', String(unreadCount));
        window.dispatchEvent(
            new CustomEvent('notif-count-changed', { detail: { count: unreadCount } })
        );
    }, [unreadCount]);

    // ── Mark single as READ ───────────────────────────────────
    const markRead = async (notif: Notification) => {
        if (notif.read_at) {
            if (notif.data.action_url) router.visit(notif.data.action_url);
            return;
        }
        setLoading(notif.id);
        const res = await apiFetch('PATCH', `/notifications/${notif.id}/read`);
        if (res.ok) {
            setItems(prev => prev.map(n => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnread(c => Math.max(0, c - 1));
        }
        setLoading(null);
        if (res.ok && notif.data.action_url) router.visit(notif.data.action_url);
    };

    // ── Mark single as UNREAD ─────────────────────────────────
    const markUnread = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setLoading(id);
        const res = await apiFetch('PATCH', `/notifications/${id}/unread`);
        if (res.ok) {
            setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: null } : n));
            setUnread(c => c + 1);
        }
        setLoading(null);
    };

    // ── Dismiss (delete) single ───────────────────────────────
    const dismiss = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const notif = items.find(n => n.id === id);
        setItems(prev => prev.filter(n => n.id !== id));
        if (notif && !notif.read_at) setUnread(c => Math.max(0, c - 1));
        setSelectedIds(prev => prev.filter(i => i !== id));
        await apiFetch('DELETE', `/notifications/${id}`);
    };

    // ── Bulk actions ──────────────────────────────────────────
    const eligibleIds = items.map(n => n.id); // all notifications are deletable
    const selectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(eligibleIds);
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setConfirmBulkDelete(true);
    };

    const executeBulkDelete = async () => {
        setBulkDeleting(true);
        setConfirmBulkDelete(false);
        const unreadToRemove = items.filter(n => selectedIds.includes(n.id) && !n.read_at).length;
        await Promise.all(selectedIds.map(id => apiFetch('DELETE', `/notifications/${id}`)));
        setItems(prev => prev.filter(n => !selectedIds.includes(n.id)));
        setUnread(prev => Math.max(0, prev - unreadToRemove));
        setSelectedIds([]);
        setBulkDeleting(false);
    };

    // ── Mark all as READ ──────────────────────────────────────
    const markAllRead = async () => {
        const res = await apiFetch('POST', '/notifications/read-all');
        if (!res.ok) return;
        setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
        setUnread(0);
    };

    // ── Mark all as UNREAD ────────────────────────────────────
    const markAllUnread = async () => {
        const res = await apiFetch('POST', '/notifications/unread-all');
        if (!res.ok) return;
        setItems(prev => prev.map(n => ({ ...n, read_at: null })));
        setUnread(items.length);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 w-full">

                {/* Header with bulk controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bell className="w-6 h-6 text-black dark:text-white" />
                        <h1 className="text-2xl font-bold text-black dark:text-white">Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="text-xs font-bold bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full">
                                {unreadCount} unread
                            </span>
                        )}
                    </div>

                    {/* Bulk actions */}
                    {items.length > 0 && (
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === eligibleIds.length && selectedIds.length > 0}
                                    onChange={selectAll}
                                    className="w-4 h-4 text-amber-600 rounded border-neutral-300 dark:border-neutral-600"
                                />
                                <span>Select all</span>
                            </label>
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={bulkDeleting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800/40 transition-colors disabled:opacity-50"
                                >
                                    {bulkDeleting ? (
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                    ) : <Trash2 className="w-4 h-4" />}
                                    Delete Selected ({selectedIds.length})
                                </button>
                            )}
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-black dark:border-white text-black dark:text-white text-sm font-medium hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    Mark all as read
                                </button>
                            )}
                            {allRead && (
                                <button
                                    onClick={markAllUnread}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-500 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-500 hover:text-white transition-colors"
                                >
                                    <BellRing className="w-4 h-4" />
                                    Mark all as unread
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* List */}
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-black dark:text-white">
                        <BellOff className="w-16 h-16 opacity-20" strokeWidth={1} />
                        <p className="text-lg font-medium">No notifications yet</p>
                        <p className="text-sm opacity-50">You'll be notified when someone buys your artwork.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {items.map((notif) => {
                            const notifType     = notif.data.type ?? 'default';
                            const IconComponent = TYPE_ICONS[notifType] ?? TYPE_ICONS.default;
                            const isUnread      = !notif.read_at;
                            const isSale        = notifType === 'artwork_sold';
                            const isCancelled   = notifType === 'order_cancelled';

                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => markRead(notif)}
                                    className={`group relative flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-150 ${
                                        isUnread
                                            ? 'border-black dark:border-neutral-500 bg-white dark:bg-neutral-900'
                                            : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 opacity-60'
                                    } hover:opacity-100`}
                                >
                                    {/* Checkbox */}
                                    <div onClick={(e) => e.stopPropagation()} className="shrink-0 pt-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(notif.id)}
                                            onChange={(e) => toggleSelect(notif.id, e as any)}
                                            className="w-4 h-4 text-amber-600 rounded border-neutral-300 dark:border-neutral-600"
                                        />
                                    </div>

                                    {/* Unread dot (only for non-sale/cancelled types) */}
                                    {isUnread && !isSale && !isCancelled && (
                                        <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${DOT_COLORS[notifType] ?? DOT_COLORS.default}`} />
                                    )}

                                    {/* Artwork image OR icon fallback */}
                                    <div className="relative shrink-0">
                                        {notif.data.artwork_image ? (
                                            <img
                                                src={notif.data.artwork_image}
                                                alt={notif.data.artwork ?? 'Artwork'}
                                                className="w-12 h-12 rounded-xl object-cover border border-black/10 dark:border-white/10"
                                            />
                                        ) : (
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                isSale
                                                    ? 'bg-green-500 text-white'
                                                    : isCancelled
                                                    ? 'bg-red-500 text-white'
                                                    : isUnread
                                                        ? 'bg-black dark:bg-white text-white dark:text-black'
                                                        : 'bg-gray-100 dark:bg-neutral-800 text-black dark:text-white'
                                            }`}>
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                        )}
                                        {/* Typed badge pinned to bottom-right of image */}
                                        {notif.data.artwork_image && (
                                            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow ${
                                                isSale ? 'bg-green-500' : isCancelled ? 'bg-red-500' : 'bg-black dark:bg-white'
                                            }`}>
                                                <IconComponent className="w-3 h-3 text-white dark:text-black" />
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-16">

                                        {/* Sale: highlight buyer name */}
                                        {isSale && notif.data.buyer_name ? (
                                            <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-black dark:text-white' : 'text-black dark:text-white'}`}>
                                                <span className="text-green-600 dark:text-green-400 font-bold">
                                                    {notif.data.buyer_name}
                                                </span>{' '}
                                                purchased your artwork.
                                            </p>
                                        ) : isCancelled && notif.data.buyer_name ? (
                                            <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-black dark:text-white' : 'text-black dark:text-white'}`}>
                                                <span className="text-red-600 dark:text-red-400 font-bold">
                                                    {notif.data.buyer_name}
                                                </span>{' '}
                                                cancelled their order.
                                            </p>
                                        ) : (
                                            <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-black dark:text-white' : 'text-black dark:text-white'}`}>
                                                {notif.data.message}
                                            </p>
                                        )}

                                        {/* Artwork title */}
                                        {notif.data.artwork && (
                                            <p className="text-xs text-black/50 dark:text-white/50 mt-0.5 truncate">
                                                🎨 {notif.data.artwork}
                                            </p>
                                        )}

                                        {/* Cancellation reason — always show, fallback if null */}
                                        {isCancelled && (
                                            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1 italic">
                                                Reason: {notif.data.reason ?? 'No reason provided'}
                                            </p>
                                        )}

                                        <p className="text-xs text-black/40 dark:text-white/40 mt-1">
                                            {notif.human_time}
                                        </p>

                                        {/* Bottom badge — below timestamp, clear of action buttons */}
                                        {isSale && (
                                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                <ShoppingBag className="w-3 h-3" />
                                                Purchased
                                            </span>
                                        )}
                                        {isCancelled && (
                                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                                <XCircle className="w-3 h-3" />
                                                Cancelled
                                            </span>
                                        )}
                                    </div>

                                    {/* Per-item actions */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                                        {/* Mark as READ */}
                                        {isUnread && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); markRead(notif); }}
                                                title="Mark as read"
                                                className="p-1 rounded-lg text-black/30 dark:text-white/30 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                                            >
                                                <CheckCheck className="w-3.5 h-3.5" />
                                            </button>
                                        )}

                                        {/* Mark as UNREAD */}
                                        {!isUnread && (
                                            <button
                                                onClick={(e) => markUnread(notif.id, e)}
                                                title="Mark as unread"
                                                className="p-1 rounded-lg text-black/30 dark:text-white/30 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                                            >
                                                <BellRing className="w-3.5 h-3.5" />
                                            </button>
                                        )}

                                        {/* Dismiss */}
                                        <button
                                            onClick={(e) => dismiss(notif.id, e)}
                                            title="Dismiss"
                                            className="p-1 rounded-lg text-black/30 dark:text-white/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Loading spinner */}
                                    {loading === notif.id && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-neutral-900/60 rounded-2xl">
                                        <Loader2 className="animate-spin w-5 h-5 text-black dark:text-white" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        {notifications.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-2">
                                {notifications.current_page > 1 && (
                                    <a
                                        href={`/notifications?page=${notifications.current_page - 1}`}
                                        className="px-4 py-2 rounded-lg border border-black dark:border-neutral-600 text-sm font-medium text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors"
                                    >
                                        ← Previous
                                    </a>
                                )}
                                <span className="text-sm text-black/50 dark:text-white/50">
                                    Page {notifications.current_page} of {notifications.last_page}
                                </span>
                                {notifications.current_page < notifications.last_page && (
                                    <a
                                        href={`/notifications?page=${notifications.current_page + 1}`}
                                        className="px-4 py-2 rounded-lg border border-black dark:border-neutral-600 text-sm font-medium text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors"
                                    >
                                        Next →
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* ── Bulk delete confirm modal ── */}
            {confirmBulkDelete && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-black dark:border-neutral-600 w-full max-w-sm p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-black dark:text-white">Delete {selectedIds.length} Notification{selectedIds.length > 1 ? 's' : ''}?</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-black dark:text-neutral-300">
                            Are you sure you want to permanently remove the selected notifications?
                        </p>
                        <div className="flex gap-3 mt-1">
                            <button
                                onClick={() => setConfirmBulkDelete(false)}
                                className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-black dark:text-white font-medium py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeBulkDelete}
                                className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 text-sm transition flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}