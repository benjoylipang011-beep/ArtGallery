import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Package, Image, PlusCircle, Tag, Archive, ChevronRight } from 'lucide-react';
import { useState } from 'react';
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

const footerNavItems = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

const productSubItems = [
    { title: 'All Artworks', href: '/products', icon: Image },
    { title: 'Add Artwork', href: '/products/create', icon: PlusCircle },
    { title: 'Categories', href: '/products/categories', icon: Tag },
    { title: 'Archived', href: '/products/archived', icon: Archive },
];

export function AppSidebar() {
    const { url } = usePage();
    const isProductActive = url.startsWith('/products');
    const [open, setOpen] = useState(isProductActive);

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
                            <SidebarMenuButton
                                asChild
                                tooltip="Dashboard"
                                isActive={url === String(dashboard())}
                            >
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
                                    <SidebarMenuButton
                                        tooltip="Products"
                                        isActive={isProductActive}
                                    >
                                        <Package className="shrink-0" />
                                        <span>Products</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
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