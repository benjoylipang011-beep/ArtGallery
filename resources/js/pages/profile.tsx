import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useRef, useState } from 'react';
import { Camera, User, Mail, Phone, MapPin, Globe, FileText, Save, Loader2, CheckCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Profile',   href: '/profile'   },
];

interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    location?: string | null;
    website?: string | null;
    bio?: string | null;
    avatar?: string | null;
    profile_photo_url?: string | null;
}

export default function ProfilePage() {
    const { auth } = usePage().props as { auth: { user: UserProfile } };
    const user = auth.user;

    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        user.avatar ? `/storage/${user.avatar}` : (user.profile_photo_url ?? null)
    );
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        name:     user.name     ?? '',
        email:    user.email    ?? '',
        phone:    user.phone    ?? '',
        location: user.location ?? '',
        website:  user.website  ?? '',
        bio:      user.bio      ?? '',
        avatar:   null as File | null,
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('avatar', file);
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile', {
            forceFormData: true,
            onSuccess: () => {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            },
        });
    };

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Profile" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 max-w-4xl mx-auto w-full">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">My Profile</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage your personal information and public presence.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Avatar + cover card - with 3px silver border */}
                    <div className="rounded-2xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
                        {/* Cover banner */}
                        <div className="h-28 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 relative">
                            <div className="absolute inset-0 opacity-20"
                                style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }}
                            />
                        </div>

                        <div className="px-6 pb-6">
                            <div className="flex items-end justify-between -mt-12 mb-4">
                                {/* Avatar */}
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-neutral-900 overflow-hidden bg-gradient-to-br from-amber-300 to-orange-500 shadow-lg flex items-center justify-center">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-white">{initials}</span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                                    >
                                        <Camera className="w-6 h-6 text-white drop-shadow" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>

                                {/* Save button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-sm"
                                >
                                    {processing ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                    ) : saved ? (
                                        <><CheckCircle className="w-4 h-4" /> Saved!</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> Save Changes</>
                                    )}
                                </button>
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{user.name}</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info Card - with 3px silver border */}
                    <div className="rounded-2xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-5">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Full Name */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Your full name"
                                    className="px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition"
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" /> Email Address
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="your@email.com"
                                    className="px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition"
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    placeholder="+63 9XX XXX XXXX"
                                    className="px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition"
                                />
                                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                            </div>

                            {/* Location */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" /> Location
                                </label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    placeholder="Davao City, Philippines"
                                    className="px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition"
                                />
                                {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
                            </div>

                            {/* Website */}
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5" /> Website / Portfolio
                                </label>
                                <input
                                    type="url"
                                    value={data.website}
                                    onChange={e => setData('website', e.target.value)}
                                    placeholder="https://yourportfolio.com"
                                    className="px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition"
                                />
                                {errors.website && <p className="text-xs text-red-500">{errors.website}</p>}
                            </div>

                            {/* Bio */}
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> Bio
                                </label>
                                <textarea
                                    value={data.bio}
                                    onChange={e => setData('bio', e.target.value)}
                                    rows={4}
                                    placeholder="Tell others a little about yourself and your art..."
                                    className="px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition resize-none"
                                />
                                <p className="text-xs text-neutral-400 text-right">{data.bio.length} / 500</p>
                                {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
                            </div>

                        </div>
                    </div>

                    {/* Avatar upload hint card - with 3px silver border */}
                    <div className="rounded-2xl border-[3px] border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <Camera className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Profile Photo</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">JPG, PNG or WEBP. Max 2MB. Click your avatar above to change it.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
                        >
                            Upload
                        </button>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}