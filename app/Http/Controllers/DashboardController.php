<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\SavedArtwork;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        // ── User-specific analytics ──────────────────────────────────────────
        $userId = $user->id;

        // My artworks stats
        $myTotalArtworks = Artwork::where('user_id', $userId)->count();
        $myTotalRevenue  = Schema::hasTable('orders')
            ? Order::where('user_id', $userId)->where('status', 'paid')->sum('total')
            : 0;
        $myTotalOrders   = Schema::hasTable('orders')
            ? Order::where('user_id', $userId)->count()
            : 0;
        $myCartCount     = Schema::hasTable('cart_items')
            ? CartItem::where('user_id', $userId)->count()
            : 0;
        $myPendingOrders = Schema::hasTable('orders')
            ? Order::where('user_id', $userId)->where('status', 'pending')->count()
            : 0;

        // My artworks by category
        $byCategory = Artwork::select('category', DB::raw('count(*) as count'))
            ->where('user_id', $userId)
            ->whereNotNull('category')
            ->groupBy('category')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => ['label' => $r->category, 'count' => (int) $r->count]);

        // My artworks by status
        $byStatus = Artwork::select('status', DB::raw('count(*) as count'))
            ->where('user_id', $userId)
            ->groupBy('status')
            ->get()
            ->map(fn($r) => ['label' => ucfirst($r->status), 'count' => (int) $r->count]);

        // My artworks by medium
        $byMedium = Artwork::select('medium', DB::raw('count(*) as count'))
            ->where('user_id', $userId)
            ->whereNotNull('medium')
            ->groupBy('medium')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => ['label' => $r->medium, 'count' => (int) $r->count]);

        // My top 5 artworks by price
        $topArtworks = Artwork::where('user_id', $userId)
            ->orderByDesc('price')
            ->take(5)
            ->get()
            ->map(fn($a) => [
                'title'  => $a->title,
                'artist' => $a->artist,
                'price'  => (float) $a->price,
                'status' => $a->status,
            ]);

        // My artworks added per month (last 6 months)
        $monthlyArtworks = Artwork::select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('count(*) as count')
            )
            ->where('user_id', $userId)
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy(DB::raw('YEAR(created_at)'), DB::raw('MONTH(created_at)'))
            ->orderBy(DB::raw('YEAR(created_at)'))->orderBy(DB::raw('MONTH(created_at)'))
            ->get()
            ->map(fn($r) => [
                'label' => date('M Y', mktime(0, 0, 0, $r->month, 1, $r->year)),
                'count' => (int) $r->count,
            ]);

        // ✅ 'dashboard' matches resources/js/pages/dashboard.tsx (lowercase)
        return Inertia::render('dashboard', [
            'artworks'      => $artworks->values(),
            'savedArtworks' => $savedArtworks->values(),
            'stats'         => [
                'totalArtworks'  => Artwork::count(),
                'savedCount'     => count($savedIds),
                'liveExhibitions'=> 2,
                'myArtworks'     => $myTotalArtworks,
                'myOrders'       => $myTotalOrders,
                'myRevenue'      => (float) $myTotalRevenue,
                'myCartCount'    => $myCartCount,
                'myPendingOrders'=> $myPendingOrders,
            ],
            'analytics' => [
                'byCategory'     => $byCategory->values(),
                'byStatus'       => $byStatus->values(),
                'byMedium'       => $byMedium->values(),
                'topArtworks'    => $topArtworks->values(),
                'monthlyArtworks'=> $monthlyArtworks->values(),
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