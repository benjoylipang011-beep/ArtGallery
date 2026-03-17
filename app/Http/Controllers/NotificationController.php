<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    // ── Full page ─────────────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $paginated = $request->user()
            ->notifications()
            ->paginate(15);

        $items = $paginated->getCollection()->map(fn ($n) => [
            'id'         => $n->id,
            'type'       => $n->type,
            'data'       => $n->data,
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
                'data'       => $n->data,
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