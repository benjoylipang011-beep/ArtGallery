import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { Tag, PlusCircle, Pencil, Trash2, PackageOpen, X, Check } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: '/products' },
    { title: 'Categories', href: '/products/categories' },
];

interface Category {
    id: number;
    name: string;
    description: string | null;
    artworks_count: number;
}

interface Props {
    categories: Category[];
}

export default function CategoriesIndex({ categories }: Props) {
    const [showForm, setShowForm]     = useState(false);
    const [editId, setEditId]         = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [form, setForm]             = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    const openCreate = () => {
        setEditId(null);
        setForm({ name: '', description: '' });
        setShowForm(true);
    };

    const openEdit = (cat: Category) => {
        setEditId(cat.id);
        setForm({ name: cat.name, description: cat.description ?? '' });
        setShowForm(true);
    };

    const handleSubmit = () => {
        setSubmitting(true);
        if (editId) {
            router.put(`/products/categories/${editId}`, form, {
                onSuccess: () => { setShowForm(false); setSubmitting(false); },
                onError:   () => setSubmitting(false),
            });
        } else {
            router.post('/products/categories', form, {
                onSuccess: () => { setShowForm(false); setForm({ name: '', description: '' }); setSubmitting(false); },
                onError:   () => setSubmitting(false),
            });
        }
    };

    const handleDelete = (id: number) => {
        setDeletingId(id);
        router.delete(`/products/categories/${id}`, {
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 w-full">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Tag className="w-6 h-6 text-amber-500" />
                        <h1 className="text-2xl font-bold text-black dark:text-white">Categories</h1>
                        <span className="text-sm text-black">({categories.length})</span>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors"
                    >
                        <PlusCircle className="w-4 h-4" />
                        New Category
                    </button>
                </div>

                {/* Create / Edit Form */}
                {showForm && (
                    <div className="rounded-xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-black dark:text-white">
                                {editId ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-black hover:text-black dark:hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs font-medium text-black dark:text-black uppercase tracking-wider">Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Oil Painting"
                                    className="mt-1 w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-black dark:text-black uppercase tracking-wider">Description <span className="normal-case font-normal">(optional)</span></label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Brief description of this category..."
                                    rows={2}
                                    className="mt-1 w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-black dark:text-black hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !form.name.trim()}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                                >
                                    {submitting ? (
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    {editId ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-black">
                        <PackageOpen className="w-16 h-16 opacity-30" strokeWidth={1} />
                        <p className="text-lg font-medium">No categories yet</p>
                        <button
                            onClick={openCreate}
                            className="mt-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
                        >
                            Create your first category
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="rounded-xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-3 hover:border-amber-400 dark:hover:border-amber-500/50 transition-colors group"
                            >
                                {/* Icon + name */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                                            <Tag className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-black dark:text-white leading-tight">{cat.name}</p>
                                            <p className="text-xs text-black mt-0.5">
                                                {cat.artworks_count} artwork{cat.artworks_count !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {cat.description && (
                                    <p className="text-xs text-black dark:text-black line-clamp-2 leading-relaxed">
                                        {cat.description}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 mt-auto pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <Link
                                        href={`/products?category=${cat.id}`}
                                        className="flex-1 text-center text-xs font-medium py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-black dark:text-black hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                    >
                                        View Artworks
                                    </Link>
                                    <button
                                        onClick={() => openEdit(cat)}
                                        className="p-1.5 rounded-lg text-black hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        disabled={deletingId === cat.id}
                                        className="p-1.5 rounded-lg text-black hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                                        title="Delete"
                                    >
                                        {deletingId === cat.id ? (
                                            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                            </svg>
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}