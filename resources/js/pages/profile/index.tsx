import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, User, Mail, Phone, MapPin, Globe, FileText, Save, Loader2, CheckCircle, Pencil, X, Crosshair, Search } from 'lucide-react';

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


// ── MapLibre GL map for location picking (supports free rotation) ─────────────
declare global {
    interface Window { maplibregl: any; }
}

function LocationMap({ location, onLocationChange }: {
    location: string;
    onLocationChange: (place: string) => void;
}) {
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchInput, setSearchInput] = useState(location);
    const [locating, setLocating] = useState(false);
    const [bearing, setBearing] = useState(0);
    const [isSatellite, setIsSatellite] = useState(false);

    // Load MapLibre GL CSS + JS once
    useEffect(() => {
        if (window.maplibregl) { setMapReady(true); return; }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
        document.head.appendChild(link);
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
        script.onload = () => setMapReady(true);
        document.head.appendChild(script);
    }, []);

    // Init map
    useEffect(() => {
        if (!mapReady || !mapContainerRef.current || mapRef.current) return;
        const ml = window.maplibregl;

        const map = new ml.Map({
            container: mapContainerRef.current,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                        maxzoom: 19,
                    },
                    satellite: {
                        type: 'raster',
                        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                        tileSize: 256,
                        attribution: '© <a href="https://www.esri.com">Esri</a>',
                        maxzoom: 19,
                    },
                },
                layers: [
                    { id: 'osm-layer', type: 'raster', source: 'osm', layout: { visibility: 'visible' } },
                    { id: 'satellite-layer', type: 'raster', source: 'satellite', layout: { visibility: 'none' } },
                ],
            },
            center: [125.6087, 7.0707],
            zoom: 12,
            bearing: 0,
            pitch: 0,
        });

        // Navigation control (zoom + compass/rotate)
        map.addControl(new ml.NavigationControl({ visualizePitch: true }), 'top-right');

        // Track bearing for compass indicator
        map.on('rotate', () => setBearing(map.getBearing()));

        // Custom amber pin marker element
        const el = document.createElement('div');
        el.innerHTML = `<div style="width:28px;height:28px;background:#d97706;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.35);cursor:grab"></div>`;
        el.style.width = '28px';
        el.style.height = '28px';

        const marker = new ml.Marker({ element: el, draggable: true, anchor: 'bottom' })
            .setLngLat([125.6087, 7.0707])
            .addTo(map);

        markerRef.current = marker;
        mapRef.current = map;

        // Click map → check if a named feature was clicked, else reverse geocode
        map.on('click', async (e: any) => {
            const { lng, lat } = e.lngLat;
            marker.setLngLat([lng, lat]);

            // Try to get the name of the clicked feature from the map
            const features = map.queryRenderedFeatures(e.point);
            const named = features?.find((f: any) => f.properties?.name);

            if (named?.properties?.name) {
                const name = named.properties.name;
                // Reverse geocode to get full address, but prepend the clicked name
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await res.json();
                    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
                    const state = data.address?.state || '';
                    const country = data.address?.country || '';
                    const place = [name, city, state, country].filter(Boolean).join(', ');
                    setSearchInput(place);
                    onLocationChange(place);
                } catch {
                    setSearchInput(name);
                    onLocationChange(name);
                }
            } else {
                await reverseGeocode(lat, lng);
            }
        });

        // Drag marker end → reverse geocode
        marker.on('dragend', async () => {
            const { lng, lat } = marker.getLngLat();
            await reverseGeocode(lat, lng);
        });

        // If user already has a saved location, geocode it on mount
        if (location) geocodeSearch(location, false);

        return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
    }, [mapReady]);

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            const place = [
                data.address?.city || data.address?.town || data.address?.village || data.address?.county,
                data.address?.state,
                data.address?.country,
            ].filter(Boolean).join(', ') || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setSearchInput(place);
            onLocationChange(place);
        } catch {
            const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setSearchInput(fallback);
            onLocationChange(fallback);
        }
    };

    const [noResults, setNoResults] = useState(false);
    const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string; address: any }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const geocodeSearch = async (query: string, updateInput = true, forSuggestions = false) => {
        if (!query.trim() || !mapRef.current) return;
        setSearching(true);
        setNoResults(false);
        try {
            const center = mapRef.current.getCenter();
            const viewbox = `${center.lng - 2},${center.lat - 2},${center.lng + 2},${center.lat + 2}`;

            let data: any[] = [];
            const attempt1 = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&viewbox=${viewbox}&bounded=0`,
                { headers: { 'Accept-Language': 'en' } }
            );
            data = await attempt1.json();

            if (data.length === 0) {
                const attempt2 = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Philippines')}&format=json&limit=5&addressdetails=1`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                data = await attempt2.json();
            }

            // Show dropdown suggestions when typing
            if (forSuggestions) {
                setSuggestions(data);
                setShowSuggestions(data.length > 0);
                return;
            }

            if (data.length > 0) {
                const { lat, lon, address, display_name } = data[0];
                mapRef.current.flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 16, speed: 1.4, curve: 1.4 });
                markerRef.current?.setLngLat([parseFloat(lon), parseFloat(lat)]);
                if (updateInput) {
                    const short = [
                        address?.amenity || address?.building,
                        address?.road,
                        address?.suburb || address?.neighbourhood || address?.quarter,
                        address?.city || address?.town || address?.village || address?.county,
                        address?.state,
                        address?.country,
                    ].filter(Boolean).join(', ') || display_name;
                    setSearchInput(short);
                    onLocationChange(short);
                }
                setShowSuggestions(false);
            } else {
                setNoResults(true);
            }
        } finally {
            setSearching(false);
        }
    };

    const selectSuggestion = (item: { display_name: string; lat: string; lon: string; address: any }) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        mapRef.current?.flyTo({ center: [lon, lat], zoom: 16, speed: 1.4, curve: 1.4 });
        markerRef.current?.setLngLat([lon, lat]);
        const short = [
            item.address?.amenity || item.address?.building,
            item.address?.road,
            item.address?.suburb || item.address?.neighbourhood || item.address?.quarter,
            item.address?.city || item.address?.town || item.address?.village || item.address?.county,
            item.address?.state,
            item.address?.country,
        ].filter(Boolean).join(', ') || item.display_name;
        setSearchInput(short);
        onLocationChange(short);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    // Sync when parent location field is typed into directly
    useEffect(() => {
        if (location !== searchInput) setSearchInput(location);
    }, [location]);

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { e.preventDefault(); geocodeSearch(searchInput); }
    };

    const handleGPS = () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const { latitude: lat, longitude: lng } = coords;
                mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, speed: 1.4 });
                markerRef.current?.setLngLat([lng, lat]);
                await reverseGeocode(lat, lng);
                setLocating(false);
            },
            () => setLocating(false)
        );
    };

    const resetNorth = () => {
        mapRef.current?.easeTo({ bearing: 0, duration: 500 });
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Search bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black pointer-events-none" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={e => {
                            const val = e.target.value;
                            setSearchInput(val);
                            setNoResults(false);
                            if (debounceRef.current) clearTimeout(debounceRef.current);
                            if (val.trim().length >= 3) {
                                debounceRef.current = setTimeout(() => geocodeSearch(val, true, true), 400);
                            } else {
                                setSuggestions([]);
                                setShowSuggestions(false);
                            }
                        }}
                        onKeyDown={handleSearchKeyDown}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        placeholder="Search a place on the map..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition"
                    />
                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-50 overflow-hidden">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onMouseDown={() => selectSuggestion(s)}
                                    className="w-full text-left px-3 py-2.5 text-sm text-black dark:text-white hover:bg-amber-50 dark:hover:bg-neutral-800 flex items-start gap-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0 transition-colors"
                                >
                                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                    <span className="truncate">{s.display_name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button type="button" onClick={() => geocodeSearch(searchInput)} disabled={searching}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition disabled:opacity-60 flex items-center gap-1.5 shrink-0">
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {searching ? 'Searching...' : 'Search'}
                </button>
                <button type="button" onClick={handleGPS} disabled={locating} title="Use my current location"
                    className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-neutral-300 transition disabled:opacity-60 shrink-0">
                    {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                </button>
            </div>

            {/* Map container */}
            <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700" style={{ height: '280px' }}>
                {!mapReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 z-10">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                    </div>
                )}
                <div ref={mapContainerRef} className="w-full h-full" />

                {/* Satellite / Street toggle */}
                <button
                    type="button"
                    onClick={() => {
                        const map = mapRef.current;
                        if (!map) return;
                        const next = !isSatellite;
                        map.setLayoutProperty('osm-layer', 'visibility', next ? 'none' : 'visible');
                        map.setLayoutProperty('satellite-layer', 'visibility', next ? 'visible' : 'none');
                        setIsSatellite(next);
                    }}
                    className="absolute top-2 right-12 z-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                >
                    {isSatellite ? '🗺️ Street' : '🛰️ Satellite'}
                </button>

                {/* Compass / reset north button */}
                {Math.abs(bearing) > 1 && (
                    <button
                        type="button"
                        onClick={resetNorth}
                        title="Reset to North"
                        className="absolute top-2 left-2 z-10 w-9 h-9 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ transform: `rotate(${bearing}deg)`, transition: 'transform 0.1s' }}>
                            <path d="M12 2L8 10h8L12 2z" fill="#d97706" />
                            <path d="M12 22L8 14h8L12 22z" fill="#9ca3af" />
                        </svg>
                    </button>
                )}

                {/* Current location label */}
                <div className="absolute bottom-2 left-2 z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs text-black dark:text-black flex items-center gap-1.5 pointer-events-none max-w-[80%] shadow-sm">
                    <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate">{searchInput || 'Click map or drag pin to set location'}</span>
                </div>
            </div>

            {noResults && (
                <p className="text-xs text-rose-500 flex items-center gap-1.5">
                    <span>⚠️</span> No results found for "<strong>{searchInput}</strong>". Try being more specific or click directly on the map.
                </p>
            )}
            <p className="text-xs text-black">
                🖱️ <strong>Left-drag</strong> to pan · <strong>Right-drag</strong> to rotate · <strong>Scroll</strong> to zoom · <strong>Click</strong> to drop pin
            </p>
        </div>
    );
}

export default function ProfilePage() {
    const { auth } = usePage().props as { auth: { user: UserProfile } };
    const user = auth.user;

    const [isEditing, setIsEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        user.avatar ? `/storage/${user.avatar}` : (user.profile_photo_url ?? null)
    );
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
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
                setIsEditing(false);
                setTimeout(() => setSaved(false), 3000);
            },
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        reset();
        setAvatarPreview(
            user.avatar ? `/storage/${user.avatar}` : (user.profile_photo_url ?? null)
        );
    };

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Profile" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 max-w-4xl mx-auto w-full">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">My Profile</h1>
                        <p className="text-sm text-black dark:text-black mt-1">
                            {isEditing ? 'Make changes and save when ready.' : 'Manage your personal information and public presence.'}
                        </p>
                    </div>
                    {!isEditing && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors shadow-sm"
                        >
                            <Pencil className="w-4 h-4" /> Edit Profile
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Avatar + cover card */}
                    <div className="rounded-2xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 overflow-hidden">
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
                                    {isEditing && (
                                        <>
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
                                        </>
                                    )}
                                </div>

                                {/* Save/Cancel — edit mode only */}
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-black dark:text-neutral-300 font-semibold text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            <X className="w-4 h-4" /> Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-sm"
                                        >
                                            {processing
                                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                                : <><Save className="w-4 h-4" /> Save Changes</>
                                            }
                                        </button>
                                    </div>
                                ) : saved ? (
                                    <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                                        <CheckCircle className="w-4 h-4" /> Saved!
                                    </div>
                                ) : null}
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-black dark:text-white">{user.name}</h2>
                                <p className="text-sm text-black dark:text-black">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info Card */}
                    <div className="rounded-2xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 p-6">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-black mb-5">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Full Name */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-black dark:text-black flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Full Name
                                </label>
                                {isEditing ? (
                                    <>
                                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Your full name"
                                            className="px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition" />
                                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                    </>
                                ) : (
                                    <p className="px-3.5 py-2.5 text-sm text-black dark:text-white">{user.name || <span className="text-black">—</span>}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-black dark:text-black flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" /> Email Address
                                </label>
                                {isEditing ? (
                                    <>
                                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="your@email.com"
                                            className="px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition" />
                                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                    </>
                                ) : (
                                    <p className="px-3.5 py-2.5 text-sm text-black dark:text-white">{user.email || <span className="text-black">—</span>}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-black dark:text-black flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" /> Phone Number
                                </label>
                                {isEditing ? (
                                    <>
                                        <input type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+63 9XX XXX XXXX"
                                            className="px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition" />
                                        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                                    </>
                                ) : (
                                    <p className="px-3.5 py-2.5 text-sm text-black dark:text-white">{user.phone || <span className="text-black">—</span>}</p>
                                )}
                            </div>

                            {/* Location */}
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-xs font-medium text-black dark:text-black flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" /> Location
                                </label>
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={data.location}
                                            onChange={e => setData('location', e.target.value)}
                                            placeholder="Davao City, Philippines"
                                            className="px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition"
                                        />
                                        {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
                                        <LocationMap
                                            location={data.location}
                                            onLocationChange={(place) => setData('location', place)}
                                        />
                                    </>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-3.5 py-2.5">
                                        {user.location
                                            ? <><MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" /><span className="text-sm text-black dark:text-white">{user.location}</span></>
                                            : <span className="text-sm text-black">—</span>
                                        }
                                    </div>
                                )}
                            </div>

                            {/* Website */}
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-xs font-medium text-black dark:text-black flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5" /> Website / Portfolio
                                </label>
                                {isEditing ? (
                                    <>
                                        <input type="url" value={data.website} onChange={e => setData('website', e.target.value)} placeholder="https://yourportfolio.com"
                                            className="px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition" />
                                        {errors.website && <p className="text-xs text-red-500">{errors.website}</p>}
                                    </>
                                ) : (
                                    <p className="px-3.5 py-2.5 text-sm">
                                        {user.website
                                            ? <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">{user.website}</a>
                                            : <span className="text-black">—</span>}
                                    </p>
                                )}
                            </div>

                            {/* Bio */}
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-xs font-medium text-black dark:text-black flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> Bio
                                </label>
                                {isEditing ? (
                                    <>
                                        <textarea value={data.bio} onChange={e => setData('bio', e.target.value)} rows={4}
                                            placeholder="Tell others a little about yourself and your art..."
                                            className="px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition resize-none" />
                                        <p className="text-xs text-black text-right">{data.bio.length} / 500</p>
                                        {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
                                    </>
                                ) : (
                                    <p className="px-3.5 py-2.5 text-sm text-black dark:text-white whitespace-pre-wrap">
                                        {user.bio || <span className="text-black">—</span>}
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Avatar upload hint — edit mode only */}
                    {isEditing && (
                        <div className="rounded-2xl border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                <Camera className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-black dark:text-neutral-200">Profile Photo</p>
                                <p className="text-xs text-black dark:text-black">JPG, PNG or WEBP. Max 2MB. Click your avatar above to change it.</p>
                            </div>
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline shrink-0">
                                Upload
                            </button>
                        </div>
                    )}

                </form>
            </div>
        </AppLayout>
    );
}