import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Package, Image, PlusCircle, Tag, Archive, ChevronRight, Bell, ShoppingCart, ClipboardList, FileBarChart } from 'lucide-react';
import { useState, useEffect } from 'react';
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

const CSRF = () =>
    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

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

// ── Bell nav link (navigates to /notifications page) ─────────
function NotificationTrigger() {
    const { url }                       = usePage();
    const [unreadCount, setUnreadCount] = useState(0);
    const isActive                      = url === '/notifications';

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
    }, [url]);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Notifications" isActive={isActive}>
                <Link href="/notifications">
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
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
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