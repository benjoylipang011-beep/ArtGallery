import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: '/products' },
    { title: 'Add Artwork', href: '/products/create' },
];

export default function CreateProduct() {
    const [dragOver, setDragOver] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        artist: '',
        description: '',
        medium: '',
        year: '',
        dimensions: '',
        price: '',
        category: '',
        status: 'available',
        image: null as File | null,
    });

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        setFileName(file.name);
        setData('image', file);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleSubmit = () => {
        post('/products', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setPreview(null);
                setFileName(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Artwork" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">Add New Artwork</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Fill in the details to list a new piece in the gallery.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">

                    <div className="md:col-span-2 flex flex-col gap-5">

                        {/* Artwork Info Card */}
                        <div className="rounded-xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 p-5">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mb-4">Artwork Info</h2>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-neutral-300 mb-1">Title <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        placeholder="e.g. Solitude in Blue"
                                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                                    />
                                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-neutral-300 mb-1">Artist Name <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        value={data.artist}
                                        onChange={e => setData('artist', e.target.value)}
                                        placeholder="e.g. Maria Santos"
                                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                                    />
                                    {errors.artist && <p className="text-xs text-red-500 mt-1">{errors.artist}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-neutral-300 mb-1">Description</label>
                                    <textarea
                                        rows={4}
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Describe the artwork, its inspiration, story or technique..."
                                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Details Card */}
                        <div className="rounded-xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 p-5">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mb-4">Details</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-neutral-300 mb-1">Medium</label>
                                    <select
                                        value={data.medium}
                                        onChange={e => setData('medium', e.target.value)}
                                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                                    >
                                        <option value="">Select medium</option>
                                        <option>Oil on Canvas</option>
                                        <option>Watercolor</option>
                                        <option>Acrylic</option>
                                        <option>Charcoal</option>
                                        <option>Charcoal Pencil</option>
                                        <option>Graphite Pencil</option>
                                        <option>Colored Pencil</option>
                                        <option>Ink</option>
                                        <option>Pastel</option>
                                        <option>Digital</option>
                                        <option>Mixed Media</option>
                                        <option>Sculpture</option>
                                        <option>Photography</option>
                                        <option>Printmaking</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-neutral-300 mb-1">Year Created</label>
                                    <input
                                        type="number"
                                        value={data.year}
                                        onChange={e => setData('year', e.target.value)}
                                        placeholder="e.g. 2024"
                                        min="1800"
                                        max="2099"
                                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-neutral-300 mb-1">Dimensions</label>
                                    <input
                                        type="text"
                                        value={data.dimensions}
                                        onChange={e => setData('dimensions', e.target.value)}
                                        placeholder='e.g. 24" x 36"'
                                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-neutral-300 mb-1">Price (₱)</label>
                                    <input
                                        type="number"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        placeholder="e.g. 15000"
                                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-neutral-300 mb-1">Category</label>
                                    <select
                                        value={data.category}
                                        onChange={e => setData('category', e.target.value)}
                                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                                    >
                                        <option value="">Select category</option>
                                        <option>Abstract</option>
                                        <option>Portrait</option>
                                        <option>Landscape</option>
                                        <option>Still Life</option>
                                        <option>Drawing</option>
                                        <option>Contemporary</option>
                                        <option>Traditional</option>
                                        <option>Sculpture</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-neutral-300 mb-1">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                                    >
                                        <option value="available">Available</option>
                                        <option value="sold">Sold</option>
                                        <option value="reserved">Reserved</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5">

                        {/* Image Upload Card */}
                        <div className="rounded-xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 p-5">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mb-4">Artwork Image</h2>

                            {preview ? (
                                <div className="relative rounded-lg overflow-hidden">
                                    <img src={preview} alt="Preview" className="w-full object-cover rounded-lg max-h-64" />
                                    <button
                                        onClick={() => { setPreview(null); setFileName(null); setData('image', null); }}
                                        className="absolute top-2 right-2 w-7 h-7 bg-neutral-900/70 hover:bg-neutral-900 rounded-full flex items-center justify-center text-white transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 truncate">{fileName}</p>
                                </div>
                            ) : (
                                <label
                                    className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition ${
                                        dragOver
                                            ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800'
                                            : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'
                                    }`}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                >
                                    <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-black dark:text-white" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-black dark:text-neutral-300">
                                            Drop image here or <span className="text-black dark:text-white underline">browse</span>
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={processing}
                                className="w-full rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold py-2.5 text-sm hover:bg-neutral-700 dark:hover:bg-neutral-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Upload className="w-4 h-4" />
                                {processing ? 'Submitting...' : 'Submit Artwork'}
                            </button>
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 text-black dark:text-white font-medium py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}