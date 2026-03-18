import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, ShoppingBag, Package, Info, BellOff, BellRing } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notifications', href: '/notifications' },
];

interface NotificationData {
    type?: string;
    message: string;
    action_url?: string;
    buyer_name?: string;
    artwork?: string;
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
    artwork_sold:  'bg-green-500',
    artist_joined: 'bg-blue-500',
    exhibition:    'bg-red-500',
    comment:       'bg-gray-500',
    default:       'bg-amber-500',
};

const TYPE_ICONS: Record<string, React.ElementType> = {
    artwork_sold:  ShoppingBag,
    artist_joined: Package,
    default:       Info,
};

// ── CSRF token ────────────────────────────────────────────────
// Laravel sets an XSRF-TOKEN cookie. We read it and send it back
// as X-XSRF-TOKEN (this is the standard Laravel/Axios convention).
function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    // fallback: meta tag (set in the Blade layout by @csrf)
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

function apiFetch(method: string, url: string): Promise<Response> {
    return fetch(url, {
        method,
        headers: {
            'Accept':           'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN':     xsrfToken(),   // ← X-XSRF-TOKEN, not X-CSRF-TOKEN
        },
    });
}

export default function NotificationsIndex({ notifications }: Props) {
    const [items, setItems]        = useState<Notification[]>(notifications.data);
    const [unreadCount, setUnread] = useState(() => notifications.data.filter(n => !n.read_at).length);
    const [loading, setLoading]    = useState<string | null>(null);

    const allRead = items.length > 0 && items.every(n => n.read_at !== null);

    // ── Sync sidebar badge whenever unreadCount changes ────────────
    useEffect(() => {
        localStorage.setItem('notif_unread_count', String(unreadCount));
        window.dispatchEvent(
            new CustomEvent('notif-count-changed', { detail: { count: unreadCount } })
        );
    }, [unreadCount]);

    // ── Mark single as READ ────────────────────────────────────────
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

    // ── Mark single as UNREAD ──────────────────────────────────────
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

    // ── Mark all as READ ───────────────────────────────────────────
    const markAllRead = async () => {
        const res = await apiFetch('POST', '/notifications/read-all');
        if (!res.ok) return;
        setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
        setUnread(0);
    };

    // ── Mark all as UNREAD ─────────────────────────────────────────
    const markAllUnread = async () => {
        const res = await apiFetch('POST', '/notifications/unread-all');
        if (!res.ok) return;
        setItems(prev => prev.map(n => ({ ...n, read_at: null })));
        setUnread(items.length);
    };

    // ── Dismiss (delete) ───────────────────────────────────────────
    const dismiss = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const notif = items.find(n => n.id === id);
        setItems(prev => prev.filter(n => n.id !== id));
        if (notif && !notif.read_at) setUnread(c => Math.max(0, c - 1));
        await apiFetch('DELETE', `/notifications/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 w-full">

                {/* Header */}
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

                    {/* Bulk action buttons */}
                    {items.length > 0 && (
                        <div className="flex items-center gap-2">
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
                                    {/* Unread dot */}
                                    {isUnread && (
                                        <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${DOT_COLORS[notifType] ?? DOT_COLORS.default}`} />
                                    )}

                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        isSale
                                            ? 'bg-green-500 text-white'
                                            : isUnread
                                                ? 'bg-black dark:bg-white text-white dark:text-black'
                                                : 'bg-gray-100 dark:bg-neutral-800 text-black dark:text-white'
                                    }`}>
                                        <IconComponent className="w-5 h-5" />
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

                                        <p className="text-xs text-black/40 dark:text-white/40 mt-1">
                                            {notif.human_time}
                                        </p>
                                    </div>

                                    {/* Hover actions: mark unread + dismiss */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Toggle read/unread */}
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
                                            <svg className="animate-spin w-5 h-5 text-black dark:text-white" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                            </svg>
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
        </AppLayout>
    );
}