<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
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

        // Load saved artworks with the pivot created_at (saved date)
        $savedRows = [];
        if (Schema::hasTable('saved_artworks')) {
            $savedRows = SavedArtwork::where('user_id', $user->id)
                ->orderByDesc('created_at')
                ->get(['artwork_id', 'created_at']);
        }

        $savedIds = $savedRows->pluck('artwork_id')->toArray();

        // Build a map of artwork_id => saved_at for easy lookup
        $savedAtMap = $savedRows->keyBy('artwork_id')->map(fn($r) => $r->created_at);

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
            // Preserve the saved order (most recently saved first)
            $artworkMap = Artwork::whereIn('id', $savedIds)
                ->get()
                ->keyBy('id');

            $savedArtworks = $savedRows->map(function ($row) use ($artworkMap) {
                $a = $artworkMap->get($row->artwork_id);
                if (!$a) return null;

                $savedAt = $row->created_at;

                return [
                    'id'       => $a->id,
                    'title'    => $a->title ?? '',
                    'artist'   => $a->artist ?? '',
                    'medium'   => $a->medium ?? '',
                    'price'    => (float) ($a->price ?? 0),
                    'image'    => $a->image ? asset('storage/' . $a->image) : null,
                    // Day + date when user saved this artwork
                    'saved_at'           => $savedAt ? $savedAt->setTimezone('Asia/Manila')->toIso8601String() : null,
                    'saved_at_formatted' => $savedAt ? $savedAt->setTimezone('Asia/Manila')->format('l, F j, Y') : null,
                    'saved_at_time'      => $savedAt ? $savedAt->setTimezone('Asia/Manila')->format('g:i A') : null,
                    'saved_at_relative'  => $savedAt ? $savedAt->setTimezone('Asia/Manila')->diffForHumans() : null,
                ];
            })->filter()->values();
        }

        // ── User-specific analytics ──────────────────────────────────────────
        $userId = $user->id;

        // My artworks stats
        $myTotalArtworks = Artwork::where('user_id', $userId)->count();
        $myTotalRevenue  = Schema::hasTable('orders')
            ? (float) OrderItem::whereHas('order', fn ($q) => $q->where('status', 'delivered'))
                ->whereHas('artwork',  fn ($q) => $q->where('user_id', $userId))
                ->sum('price')
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
        $myDeliveredOrders = Schema::hasTable('orders')
            ? Order::where('status', 'delivered')
                ->whereHas('items.artwork', fn ($q) => $q->where('user_id', $userId))
                ->count()
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

        // Revenue by month — delivered orders containing MY artworks (last 6 months)
        $revenueByMonth = collect(range(5, 0))->map(function ($monthsAgo) use ($userId) {
            $date = now()->subMonths($monthsAgo);
            $revenue = OrderItem::whereHas('order', fn ($q) => $q
                    ->where('status', 'delivered')
                    ->whereYear('delivered_at',  $date->year)
                    ->whereMonth('delivered_at', $date->month)
                )
                ->whereHas('artwork', fn ($q) => $q->where('user_id', $userId))
                ->sum('price');
            return [
                'label' => $date->format('M Y'),
                'count' => (int) $revenue,
            ];
        });

        return Inertia::render('dashboard', [
            'artworks'      => $artworks->values(),
            'savedArtworks' => $savedArtworks->values(),
            'stats'         => [
                'totalArtworks'    => Artwork::count(),
                'savedCount'       => count($savedIds),
                'liveExhibitions'  => 2,
                'myArtworks'       => $myTotalArtworks,
                'myOrders'         => $myTotalOrders,
                'myRevenue'        => (float) $myTotalRevenue,
                'myCartCount'      => $myCartCount,
                'myPendingOrders'  => $myPendingOrders,
                'myDeliveredOrders'=> $myDeliveredOrders,
            ],
            'analytics' => [
                'byCategory'      => $byCategory->values(),
                'byStatus'        => $byStatus->values(),
                'byMedium'        => $byMedium->values(),
                'topArtworks'     => $topArtworks->values(),
                'monthlyArtworks' => $monthlyArtworks->values(),
                'revenueByMonth'  => $revenueByMonth->values(),
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

        $savedAt = null;
        $savedAtFormatted = null;
        $savedAtTime = null;
        $savedAtRelative = null;

        if ($saved) {
            $row = SavedArtwork::where('user_id', $user->id)
                ->where('artwork_id', $artwork->id)
                ->first(['created_at']);

            if ($row && $row->created_at) {
                $dt               = $row->created_at->setTimezone('Asia/Manila');
                $savedAt          = $dt->toIso8601String();
                $savedAtFormatted = $dt->format('l, F j, Y');
                $savedAtTime      = $dt->format('g:i A');
                $savedAtRelative  = $dt->diffForHumans();
            }
        }

        return response()->json([
            'saved'              => $saved,
            'savedCount'         => SavedArtwork::where('user_id', $user->id)->count(),
            'saved_at'           => $savedAt,
            'saved_at_formatted' => $savedAtFormatted,
            'saved_at_time'      => $savedAtTime,
            'saved_at_relative'  => $savedAtRelative,
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