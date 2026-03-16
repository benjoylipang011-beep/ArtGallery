import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { ArrowLeft, CreditCard, Truck, Zap } from 'lucide-react';

interface Artwork {
    id: number;
    title: string;
    artist: string;
    price: string | null;
    image: string | null;
    medium: string | null;
    year: number | null;
}

interface UserProfile {
    name?: string | null;
    phone?: string | null;
    location?: string | null;
}

interface Props {
    artwork: Artwork;
    userProfile?: UserProfile;
}

export default function BuyNow({ artwork, userProfile }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: '/products' },
        { title: artwork.title, href: `/products/${artwork.id}` },
        { title: 'Buy Now', href: '#' },
    ];

    const [form, setForm] = useState({
        full_name: userProfile?.name     ?? '',
        phone:     userProfile?.phone    ?? '',
        address:   userProfile?.location ?? '',
        payment_method: 'cash_on_delivery',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = () => {
        setSubmitting(true);
        router.post('/cart/buy-now/place', { ...form, artwork_id: artwork.id }, {
            onError: () => setSubmitting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Buy ${artwork.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl w-full">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href={`/products/${artwork.id}`} className="text-black hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <h1 className="text-2xl font-bold text-black dark:text-white">Buy Now</h1>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">

                    {/* Form */}
                    <div className="md:col-span-2 flex flex-col gap-5">

                        {/* Delivery info */}
                        <div className="rounded-xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 p-5">
                            <h2 className="font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-amber-500" />
                                Delivery Information
                            </h2>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-xs font-medium text-black dark:text-black uppercase tracking-wider flex items-center gap-2">
                                        Full Name
                                        {userProfile?.name && <span className="normal-case text-xs font-normal text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full">auto-filled</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.full_name}
                                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                        placeholder="Juan dela Cruz"
                                        className="mt-1 w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-black dark:text-black uppercase tracking-wider flex items-center gap-2">
                                        Phone Number
                                        {userProfile?.phone && <span className="normal-case text-xs font-normal text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full">auto-filled</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        placeholder="09XX XXX XXXX"
                                        className="mt-1 w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-black dark:text-black uppercase tracking-wider flex items-center gap-2">
                                        Delivery Address
                                        {userProfile?.location && <span className="normal-case text-xs font-normal text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full">auto-filled from profile</span>}
                                    </label>
                                    <textarea
                                        value={form.address}
                                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                        placeholder="Street, Barangay, City, Province"
                                        rows={3}
                                        className="mt-1 w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment method */}
                        <div className="rounded-xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 p-5">
                            <h2 className="font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-amber-500" />
                                Payment Method
                            </h2>
                            <div className="flex flex-col gap-3">
                                {[
                                    { value: 'cash_on_delivery', label: 'Cash on Delivery', desc: 'Pay when your artwork arrives' },
                                    { value: 'gcash', label: 'GCash', desc: 'Pay via GCash mobile wallet' },
                                ].map((method) => (
                                    <label
                                        key={method.value}
                                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                            form.payment_method === method.value
                                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10'
                                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value={method.value}
                                            checked={form.payment_method === method.value}
                                            onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                                            className="accent-amber-500"
                                        />
                                        <div>
                                            <p className="font-medium text-sm text-black dark:text-white">{method.label}</p>
                                            <p className="text-xs text-black dark:text-black">{method.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Artwork summary */}
                    <div className="md:col-span-1">
                        <div className="rounded-xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 p-5 sticky top-4">
                            <h2 className="font-semibold text-black dark:text-white mb-4">Artwork</h2>

                            <div className="rounded-lg overflow-hidden mb-3">
                                {artwork.image ? (
                                    <img src={`/storage/${artwork.image}`} alt={artwork.title} className="w-full h-40 object-cover" />
                                ) : (
                                    <div className="w-full h-40 bg-gradient-to-br from-amber-300 to-orange-500" />
                                )}
                            </div>

                            <p className="font-semibold text-black dark:text-white">{artwork.title}</p>
                            <p className="text-sm text-black dark:text-black">{artwork.artist}</p>
                            {artwork.medium && <p className="text-xs text-black mt-1">{artwork.medium} · {artwork.year}</p>}

                            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between font-bold text-black dark:text-white">
                                <span>Total</span>
                                <span className="text-amber-600 dark:text-amber-400">
                                    {artwork.price ? `₱${Number(artwork.price).toLocaleString()}` : '—'}
                                </span>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !form.full_name || !form.phone || !form.address}
                                className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        Confirm Purchase
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}