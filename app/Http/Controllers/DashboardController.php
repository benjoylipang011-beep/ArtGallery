<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use App\Models\SavedArtwork;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $savedIds = [];
        if (Schema::hasTable('saved_artworks')) {
            $savedIds = SavedArtwork::where('user_id', $user->id)
                ->pluck('artwork_id')
                ->toArray();
        }

        $artworks = Artwork::orderByDesc('created_at')
            ->get()
            ->map(fn($a) => [
                'id'       => $a->id,
                'title'    => $a->title ?? '',
                'artist'   => $a->artist ?? '',
                'medium'   => $a->medium ?? '',
                'year'     => $a->year ?? '',
                'price'    => (float) ($a->price ?? 0),
                'category' => $a->category ?? '',
                'status'   => $a->status ?? 'available',
                'image'    => $a->image ? asset('storage/' . $a->image) : null,
                'saved'    => in_array($a->id, $savedIds),
            ]);

        $savedArtworks = collect();
        if (!empty($savedIds)) {
            $savedArtworks = Artwork::whereIn('id', $savedIds)
                ->orderByDesc('created_at')
                ->get()
                ->map(fn($a) => [
                    'id'     => $a->id,
                    'title'  => $a->title ?? '',
                    'artist' => $a->artist ?? '',
                    'medium' => $a->medium ?? '',
                    'price'  => (float) ($a->price ?? 0),
                    'image'  => $a->image ? asset('storage/' . $a->image) : null,
                ]);
        }

        // ✅ 'dashboard' matches resources/js/pages/dashboard.tsx (lowercase)
        return Inertia::render('dashboard', [
            'artworks'      => $artworks->values(),
            'savedArtworks' => $savedArtworks->values(),
            'stats'         => [
                'totalArtworks'   => Artwork::count(),
                'savedCount'      => count($savedIds),
                'liveExhibitions' => 2,
            ],
        ]);
    }

    public function toggleSave(Request $request, Artwork $artwork)
    {
        $user = $request->user();

        $existing = SavedArtwork::where('user_id', $user->id)
            ->where('artwork_id', $artwork->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $saved = false;
        } else {
            SavedArtwork::create([
                'user_id'    => $user->id,
                'artwork_id' => $artwork->id,
            ]);
            $saved = true;
        }

        return response()->json([
            'saved'      => $saved,
            'savedCount' => SavedArtwork::where('user_id', $user->id)->count(),
        ]);
    }

    public function removeSaved(Request $request, Artwork $artwork)
    {
        SavedArtwork::where('user_id', $request->user()->id)
            ->where('artwork_id', $artwork->id)
            ->delete();

        return response()->json([
            'savedCount' => SavedArtwork::where('user_id', $request->user()->id)->count(),
        ]);
    }
}