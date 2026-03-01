import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

// --- Stat Card ---
function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-6 flex flex-col gap-2">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${accent}`} />
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{label}</span>
            <span className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">{value}</span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">{sub}</span>
        </div>
    );
}

// --- Artwork Card ---
function ArtworkCard({ title, artist, medium, year, color }: { title: string; artist: string; medium: string; year: string; color: string }) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 overflow-hidden flex flex-col">
            <div className={`h-40 ${color} flex items-end p-4`}>
                <span className="text-white/70 text-xs font-mono">{medium} · {year}</span>
            </div>
            <div className="p-4">
                <p className="font-semibold text-neutral-900 dark:text-white text-sm leading-tight">{title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{artist}</p>
            </div>
        </div>
    );
}

// --- Activity Row ---
function ActivityRow({ action, subject, time, dot }: { action: string; subject: string; time: string; dot: string }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="font-medium">{action}</span> — {subject}
                </p>
            </div>
            <span className="text-xs text-neutral-400 whitespace-nowrap">{time}</span>
        </div>
    );
}

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">

                {/* Welcome Banner */}
                <div className="rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-neutral-800 dark:to-neutral-900 p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back to ArtGallery</h1>
                        <p className="text-neutral-400 text-sm mt-1">Here's what's happening in your gallery today.</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-amber-400 opacity-80" />
                        <div className="w-6 h-6 rounded-full bg-rose-400 opacity-60" />
                        <div className="w-4 h-4 rounded-full bg-sky-400 opacity-60" />
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        label="Total Artworks"
                        value="1,284"
                        sub="+12 added this week"
                        accent="bg-amber-400"
                    />
                    <StatCard
                        label="Active Artists"
                        value="47"
                        sub="3 new onboarded this month"
                        accent="bg-rose-400"
                    />
                    <StatCard
                        label="Exhibitions"
                        value="6"
                        sub="2 currently on display"
                        accent="bg-sky-400"
                    />
                </div>

                {/* Featured Artworks + Recent Activity */}
                <div className="grid gap-4 md:grid-cols-3">

                    {/* Featured Artworks — takes 2 cols */}
                    <div className="md:col-span-2 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Featured Artworks</h2>
                            <a href="#" className="text-xs text-amber-500 hover:underline">View all →</a>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <ArtworkCard title="Solitude in Blue" artist="Maria Santos" medium="Oil on Canvas" year="2023" color="bg-gradient-to-br from-blue-400 to-blue-700" />
                            <ArtworkCard title="Fragment No. 7" artist="Liam Reyes" medium="Mixed Media" year="2024" color="bg-gradient-to-br from-amber-300 to-orange-500" />
                            <ArtworkCard title="Whispers of Light" artist="Ana Villanueva" medium="Watercolor" year="2023" color="bg-gradient-to-br from-rose-300 to-pink-600" />
                            <ArtworkCard title="The Watcher" artist="Carlos Bautista" medium="Digital" year="2024" color="bg-gradient-to-br from-neutral-500 to-neutral-800" />
                            <ArtworkCard title="Golden Hour" artist="Sofia Cruz" medium="Acrylic" year="2022" color="bg-gradient-to-br from-yellow-300 to-amber-600" />
                            <ArtworkCard title="Echoes" artist="Jun Park" medium="Sculpture" year="2024" color="bg-gradient-to-br from-teal-300 to-cyan-700" />
                        </div>
                    </div>

                    {/* Recent Activity — 1 col */}
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">Recent Activity</h2>
                        <div className="flex flex-col">
                            <ActivityRow action="Artwork uploaded" subject="Solitude in Blue" time="2m ago" dot="bg-amber-400" />
                            <ActivityRow action="New artist joined" subject="Jun Park" time="1h ago" dot="bg-sky-400" />
                            <ActivityRow action="Exhibition updated" subject="Modern Visions 2024" time="3h ago" dot="bg-rose-400" />
                            <ActivityRow action="Artwork sold" subject="Fragment No. 7" time="5h ago" dot="bg-green-400" />
                            <ActivityRow action="Comment added" subject="The Watcher" time="8h ago" dot="bg-neutral-400" />
                            <ActivityRow action="New artist joined" subject="Sofia Cruz" time="1d ago" dot="bg-sky-400" />
                            <ActivityRow action="Exhibition created" subject="Echoes of the Earth" time="2d ago" dot="bg-rose-400" />
                        </div>
                    </div>

                </div>

                {/* Upcoming Exhibitions */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Upcoming Exhibitions</h2>
                        <a href="#" className="text-xs text-amber-500 hover:underline">View all →</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-neutral-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-800">
                                    <th className="pb-2 pr-4 font-medium">Exhibition</th>
                                    <th className="pb-2 pr-4 font-medium">Curator</th>
                                    <th className="pb-2 pr-4 font-medium">Date</th>
                                    <th className="pb-2 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: 'Modern Visions 2024', curator: 'Maria Santos', date: 'Mar 5 – Apr 2', status: 'Active', color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
                                    { name: 'Echoes of the Earth', curator: 'Liam Reyes', date: 'Apr 10 – May 15', status: 'Upcoming', color: 'text-sky-500 bg-sky-50 dark:bg-sky-900/20' },
                                    { name: 'Fragments & Forms', curator: 'Ana Villanueva', date: 'May 20 – Jun 30', status: 'Planning', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
                                    { name: 'Urban Pulse', curator: 'Carlos Bautista', date: 'Jul 1 – Aug 10', status: 'Planning', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
                                ].map((ex) => (
                                    <tr key={ex.name} className="border-b border-neutral-50 dark:border-neutral-800/50 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="py-3 pr-4 font-medium text-neutral-800 dark:text-neutral-200">{ex.name}</td>
                                        <td className="py-3 pr-4 text-neutral-500">{ex.curator}</td>
                                        <td className="py-3 pr-4 text-neutral-500">{ex.date}</td>
                                        <td className="py-3">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ex.color}`}>{ex.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}