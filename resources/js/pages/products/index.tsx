import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Image, MoreHorizontal, Heart, Eye } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
    {
        title: 'All Artworks',
        href: '/products',
    },
];

// Sample artwork data
const artworks = [
    {
        id: 1,
        title: 'Solitude in Blue',
        artist: 'Maria Santos',
        medium: 'Oil on Canvas',
        year: 2023,
        price: '$2,500',
        color: 'bg-gradient-to-br from-blue-400 to-blue-700',
        views: 1234,
        likes: 456,
    },
    {
        id: 2,
        title: 'Fragment No. 7',
        artist: 'Liam Reyes',
        medium: 'Mixed Media',
        year: 2024,
        price: '$1,800',
        color: 'bg-gradient-to-br from-amber-300 to-orange-500',
        views: 2100,
        likes: 678,
    },
    {
        id: 3,
        title: 'Whispers of Light',
        artist: 'Ana Villanueva',
        medium: 'Watercolor',
        year: 2023,
        price: '$950',
        color: 'bg-gradient-to-br from-rose-300 to-pink-600',
        views: 890,
        likes: 234,
    },
    {
        id: 4,
        title: 'The Watcher',
        artist: 'Carlos Bautista',
        medium: 'Digital',
        year: 2024,
        price: '$1,200',
        color: 'bg-gradient-to-br from-neutral-500 to-neutral-800',
        views: 1567,
        likes: 345,
    },
    {
        id: 5,
        title: 'Golden Hour',
        artist: 'Sofia Cruz',
        medium: 'Acrylic',
        year: 2022,
        price: '$1,650',
        color: 'bg-gradient-to-br from-yellow-300 to-amber-600',
        views: 2345,
        likes: 789,
    },
    {
        id: 6,
        title: 'Echoes',
        artist: 'Jun Park',
        medium: 'Sculpture',
        year: 2024,
        price: '$3,200',
        color: 'bg-gradient-to-br from-teal-300 to-cyan-700',
        views: 1023,
        likes: 512,
    },
    {
        id: 7,
        title: 'Metamorphosis',
        artist: 'Elena Rossi',
        medium: 'Acrylic & Ink',
        year: 2023,
        price: '$2,100',
        color: 'bg-gradient-to-br from-purple-400 to-pink-600',
        views: 1876,
        likes: 623,
    },
    {
        id: 8,
        title: 'Urban Jungle',
        artist: 'Marco Fontana',
        medium: 'Oil on Canvas',
        year: 2024,
        price: '$2,800',
        color: 'bg-gradient-to-br from-green-400 to-emerald-700',
        views: 2112,
        likes: 834,
    },
];

// Artwork Card Component
function ArtworkCard({
    title,
    artist,
    medium,
    year,
    price,
    color,
    views,
    likes,
}: {
    title: string;
    artist: string;
    medium: string;
    year: number;
    price: string;
    color: string;
    views: number;
    likes: number;
}) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 overflow-hidden flex flex-col hover:shadow-lg transition-shadow cursor-pointer group">
            {/* Image Container */}
            <div className="relative">
                <div className={`h-48 ${color} flex items-end p-4 overflow-hidden`}>
                    <span className="text-white/70 text-xs font-mono">{medium} · {year}</span>
                </div>
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors">
                        <Heart className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors">
                        <Eye className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-white text-sm leading-tight truncate">
                        {title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{artist}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {views}
                        </span>
                        <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {likes}
                        </span>
                    </div>
                    <span className="font-semibold text-sm text-amber-600 dark:text-amber-400">
                        {price}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function ProductsIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Artworks" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto rounded-xl p-4">
                {/* Header */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                            All Artworks
                        </h1>
                        <div className="flex items-center gap-2">
                            <select className="px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white">
                                <option>All Categories</option>
                                <option>Painting</option>
                                <option>Sculpture</option>
                                <option>Digital</option>
                                <option>Mixed Media</option>
                            </select>
                            <select className="px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white">
                                <option>Newest First</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Most Viewed</option>
                                <option>Most Liked</option>
                            </select>
                        </div>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Showing <span className="font-semibold">{artworks.length}</span> artworks
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search artworks by title, artist, or medium..."
                        className="flex-1 px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                    />
                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors">
                        Search
                    </button>
                </div>

                {/* Artworks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {artworks.map((artwork) => (
                        <ArtworkCard
                            key={artwork.id}
                            title={artwork.title}
                            artist={artwork.artist}
                            medium={artwork.medium}
                            year={artwork.year}
                            price={artwork.price}
                            color={artwork.color}
                            views={artwork.views}
                            likes={artwork.likes}
                        />
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Page <span className="font-semibold">1</span> of <span className="font-semibold">12</span>
                    </p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50">
                            ← Previous
                        </button>
                        <button className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
