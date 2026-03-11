import { Link, usePage, router } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Package, Image, PlusCircle, Tag, Archive, ChevronRight, Bell, X, CheckCheck, ShoppingCart, ClipboardList, FileBarChart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { dashboard } from '@/routes';

// ── Types ────────────────────────────────────────────────────
interface Notification {
    id: string;
    type: string;
    data: {
        message: string;
        action_url?: string;
    };
    read_at: string | null;
    human_time: string;
}

const DOT_COLORS: Record<string, string> = {
    artist_joined: 'bg-blue-500',
    exhibition:    'bg-red-500',
    artwork_sold:  'bg-green-500',
    comment:       'bg-gray-500',
    default:       'bg-white/30',
};

const CSRF = () =>
    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

const JSON_HEADERS = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRF-TOKEN': '',
};

// ── Page transition hook ─────────────────────────────────────
export function usePageTransition() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // router.on() returns a cleanup function in Inertia v2
        const removeStart  = router.on('start',  () => setVisible(false));
        const removeFinish = router.on('finish', () => setTimeout(() => setVisible(true), 50));

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    return visible;
}

// ── Notification Panel ───────────────────────────────────────
function NotificationPanel({
    onClose,
    onCountChange,
}: {
    onClose: () => void;
    onCountChange: (n: number) => void;
}) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount]     = useState(0);
    const [loading, setLoading]             = useState(true);

    const headers = () => ({ ...JSON_HEADERS, 'X-CSRF-TOKEN': CSRF() });

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/notifications/recent', { headers: headers() });
            if (!res.ok) return;
            const data = await res.json();
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
            onCountChange(data.unread_count);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30_000);
        return () => clearInterval(interval);
    }, []);

    const markRead = async (notif: Notification) => {
        if (!notif.read_at) {
            await fetch(`/notifications/${notif.id}/read`, { method: 'PATCH', headers: headers() });
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n));
            const next = Math.max(0, unreadCount - 1);
            setUnreadCount(next);
            onCountChange(next);
        }
        if (notif.data.action_url) { onClose(); router.visit(notif.data.action_url); }
    };

    const markAllRead = async () => {
        await fetch('/notifications/read-all', { method: 'POST', headers: headers() });
        setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        setUnreadCount(0);
        onCountChange(0);
    };

    const dismiss = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await fetch(`/notifications/${id}`, { method: 'DELETE', headers: headers() });
        setNotifications(prev => {
            const notif = prev.find(n => n.id === id);
            if (notif && !notif.read_at) {
                const next = Math.max(0, unreadCount - 1);
                setUnreadCount(next);
                onCountChange(next);
            }
            return prev.filter(n => n.id !== id);
        });
    };

    return (
        <div className="
            absolute left-full ml-2 top-0 z-50
            w-[300px] rounded-xl overflow-hidden
            bg-neutral-900 border border-white/[0.08]
            shadow-[0_8px_32px_rgba(0,0,0,0.55)]
            animate-in slide-in-from-left-2 fade-in duration-150
        ">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <span className="text-[11px] font-semibold tracking-widest text-white/50 uppercase flex items-center gap-2">
                    Notifications
                    {unreadCount > 0 && (
                        <span className="bg-amber-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </span>
                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} title="Mark all read"
                            className="text-white/25 hover:text-white/60 transition-colors">
                            <CheckCheck size={14} />
                        </button>
                    )}
                    <Link href="/notifications" onClick={onClose}
                        className="text-amber-400 text-[11px] hover:opacity-70 transition-opacity">
                        View all →
                    </Link>
                </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                {loading ? (
                    <div className="flex flex-col gap-3 p-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-3 items-start animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-white/10 mt-1.5 shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 bg-white/10 rounded w-3/4" />
                                    <div className="h-2.5 bg-white/[0.06] rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-white/20">
                        <Bell size={28} strokeWidth={1.2} />
                        <p className="text-xs">You're all caught up</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div key={notif.id} onClick={() => markRead(notif)}
                            className={`
                                group flex items-start gap-3 px-4 py-3 cursor-pointer
                                border-b border-white/[0.04] last:border-none
                                transition-colors duration-100
                                ${notif.read_at
                                    ? 'hover:bg-white/[0.03]'
                                    : 'bg-white/[0.03] hover:bg-white/[0.055]'}
                            `}>
                            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${DOT_COLORS[notif.type] ?? DOT_COLORS.default}`} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-[13px] leading-snug ${notif.read_at ? 'text-white/50' : 'text-white/88 font-medium'}`}>
                                    {notif.data.message}
                                </p>
                                <span className="text-[11px] text-white/25 mt-0.5 block">{notif.human_time}</span>
                            </div>
                            <button onClick={(e) => dismiss(notif.id, e)}
                                className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-white/60 transition-all shrink-0 mt-0.5">
                                <X size={12} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ── Bell trigger ─────────────────────────────────────────────
function NotificationTrigger() {
    const [open, setOpen]               = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const containerRef                  = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const poll = async () => {
            try {
                const res = await fetch('/notifications/recent', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': CSRF(),
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.unread_count ?? 0);
                }
            } catch { /* silent */ }
        };
        poll();
        const interval = setInterval(poll, 30_000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            <SidebarMenuItem>
                <SidebarMenuButton
                    tooltip="Notifications"
                    isActive={open}
                    onClick={() => setOpen(o => !o)}
                    className="relative"
                >
                    <span className="relative shrink-0">
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <span className="
                                absolute -top-1.5 -right-1.5
                                bg-amber-400 text-black text-[8px] font-bold
                                min-w-[14px] h-[14px] rounded-full
                                flex items-center justify-center px-[3px]
                                ring-[1.5px] ring-neutral-900
                            ">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </span>
                    <span>Notifications</span>
                </SidebarMenuButton>
            </SidebarMenuItem>

            {open && (
                <NotificationPanel
                    onClose={() => setOpen(false)}
                    onCountChange={setUnreadCount}
                />
            )}
        </div>
    );
}

// ── Static nav data ──────────────────────────────────────────
const footerNavItems = [
    { title: 'Repository',    href: 'https://github.com/laravel/react-starter-kit', icon: Folder   },
    { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits#react',  icon: BookOpen },
];

const productSubItems = [
    { title: 'All Artworks', href: '/products',             icon: Image      },
    { title: 'Add Artwork',  href: '/products/create',      icon: PlusCircle },
    { title: 'Categories',   href: '/products/categories',  icon: Tag        },
    { title: 'Archived',     href: '/products/archived',    icon: Archive    },
];

// ── AppSidebar ───────────────────────────────────────────────
export function AppSidebar() {
    const { url } = usePage();
    const isProductActive = url.startsWith('/products');
    const [open, setOpen] = useState(isProductActive);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await fetch('/cart/count', {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (res.ok) {
                    const data = await res.json();
                    setCartCount(data.count ?? 0);
                }
            } catch { /* silent */ }
        };
        fetchCart();
    }, [url]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="pb-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex flex-col items-center w-full pt-3 pb-2 px-2">
                            <img
                                src="/Gemini_Generated_Image_d9cjlzd9cjlzd9cj-removebg-preview.png"
                                alt="Bench Art Gallery Logo"
                                className="w-24 h-24 object-contain transition-all"
                            />
                            <span className="text-base font-bold text-neutral-900 dark:text-white tracking-tight text-center leading-tight mt-2 group-data-[collapsible=icon]:hidden">
                                Bench Art Gallery
                            </span>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarMenu>

                        {/* Dashboard */}
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Dashboard" isActive={url === String(dashboard())}>
                                <Link href={dashboard()}>
                                    <LayoutGrid className="shrink-0" />
                                    <span>Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Products dropdown */}
                        <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip="Products" isActive={isProductActive}>
                                        <Package className="shrink-0" />
                                        <span>Products</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                                    <SidebarMenuSub>
                                        {productSubItems.map((item) => (
                                            <SidebarMenuSubItem key={item.title}>
                                                <SidebarMenuSubButton asChild isActive={url === item.href}>
                                                    <Link href={item.href}>
                                                        <item.icon className="shrink-0 w-4 h-4" />
                                                        <span>{item.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>

                        {/* Notifications */}
                        <NotificationTrigger />

                        {/* Cart */}
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="My Cart" isActive={url === '/cart'}>
                                <Link href="/cart">
                                    <span className="relative shrink-0">
                                        <ShoppingCart className="w-4 h-4" />
                                        {cartCount > 0 && (
                                            <span className="
                                                absolute -top-1.5 -right-1.5
                                                bg-amber-400 text-black text-[8px] font-bold
                                                min-w-[14px] h-[14px] rounded-full
                                                flex items-center justify-center px-[3px]
                                                ring-[1.5px] ring-neutral-900
                                            ">
                                                {cartCount > 9 ? '9+' : cartCount}
                                            </span>
                                        )}
                                    </span>
                                    <span>My Cart</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Orders */}
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="My Orders" isActive={url === '/orders'}>
                                <Link href="/orders">
                                    <ClipboardList className="shrink-0 w-4 h-4" />
                                    <span>My Orders</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Reports */}
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Reports" isActive={url === '/reports'}>
                                <Link href="/reports">
                                    <FileBarChart className="shrink-0 w-4 h-4" />
                                    <span>Reports</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}