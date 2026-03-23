<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    // ── Enrich notification data with artwork_image URL ───────────────────────

    private function enrichData(array $data): array
    {
        $image = $data['artwork_image'] ?? null;

        if ($image) {
            // Already a full URL or already starts with /storage — don't double-wrap
            if (!str_starts_with($image, 'http') && !str_starts_with($image, '/storage')) {
                $data['artwork_image'] = Storage::url($image);
            }
            return $data;
        }

        // Legacy notifications (no artwork_image saved) — resolve from action_url
        if (!empty($data['action_url']) && preg_match('#/products/(\d+)$#', $data['action_url'], $m)) {
            $artwork = Artwork::select('image')->find((int) $m[1]);
            if ($artwork?->image) {
                $data['artwork_image'] = Storage::url($artwork->image);
            }
        }

        return $data;
    }
    // ── Full page ─────────────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $paginated = $request->user()
            ->notifications()
            ->paginate(15);

        $items = $paginated->getCollection()->map(fn ($n) => [
            'id'         => $n->id,
            'type'       => $n->type,
            'data'       => $this->enrichData($n->data),
            'read_at'    => $n->read_at?->toISOString(),
            'human_time' => $n->created_at->diffForHumans(),
            'created_at' => $n->created_at->toISOString(),
        ]);

        return Inertia::render('notifications/Index', [
            'notifications' => [
                'data'         => $items,
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    // ── Sidebar panel (recent 10) ─────────────────────────────────────────────

    public function recent(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->take(10)
            ->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'type'       => $n->data['type'] ?? 'default',
                'data'       => $this->enrichData($n->data),
                'read_at'    => $n->read_at?->toISOString(),
                'human_time' => $n->created_at->diffForHumans(),
            ]);

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $request->user()->unreadNotifications()->count(),
        ]);
    }

    // ── Mark single as read ───────────────────────────────────────────────────

    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json(['ok' => true]);
    }

    // ── Mark all as read ──────────────────────────────────────────────────────

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['ok' => true]);
    }

    // ── Mark single as unread ─────────────────────────────────────────────────

    public function markUnread(Request $request, string $id): JsonResponse
    {
        $request->user()
            ->notifications()
            ->findOrFail($id)
            ->update(['read_at' => null]);

        return response()->json(['ok' => true]);
    }

    // ── Mark all as unread ────────────────────────────────────────────────────

    public function markAllUnread(Request $request): JsonResponse
    {
        $request->user()->notifications()->update(['read_at' => null]);

        return response()->json(['ok' => true]);
    }

    // ── Dismiss (delete) one ──────────────────────────────────────────────────

    public function destroy(Request $request, string $id): JsonResponse
    {
        $request->user()
            ->notifications()
            ->findOrFail($id)
            ->delete();

        return response()->json(['ok' => true]);
    }
}