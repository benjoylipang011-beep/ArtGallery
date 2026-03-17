<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    // ── USER ─────────────────────────────────────────────────────

    public function index()
    {
        $orders = Order::with('items.artwork')
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(fn ($order) => [
                'id'             => $order->id,
                'total'          => $order->total,
                'status'         => $order->status,
                'full_name'      => $order->full_name,
                'phone'          => $order->phone,
                'address'        => $order->address,
                'payment_method' => $order->payment_method,
                'tracking_note'  => $order->tracking_note,
                'created_at'     => $order->created_at->toIso8601String(),
                'confirmed_at'   => $order->confirmed_at?->toIso8601String(),
                'shipped_at'     => $order->shipped_at?->toIso8601String(),
                'delivered_at'   => $order->delivered_at?->toIso8601String(),
                'cancelled_at'   => $order->cancelled_at?->toIso8601String(),
                'timeline'       => $order->timeline(),
                'items'          => $order->items->map(fn ($item) => [
                    'id'      => $item->id,
                    'price'   => $item->price,
                    'artwork' => $item->artwork ? [
                        'title'  => $item->artwork->title,
                        'artist' => $item->artwork->artist,
                        'image'  => $item->artwork->image,
                    ] : null,
                ]),
            ]);

        return Inertia::render('Orders/Index', compact('orders'));
    }

    public function show(Order $order)
    {
        abort_if($order->user_id !== Auth::id(), 403);

        $data = [
            'id'             => $order->id,
            'total'          => $order->total,
            'status'         => $order->status,
            'full_name'      => $order->full_name,
            'phone'          => $order->phone,
            'address'        => $order->address,
            'payment_method' => $order->payment_method,
            'tracking_note'  => $order->tracking_note,
            'created_at'     => $order->created_at->toIso8601String(),
            'confirmed_at'   => $order->confirmed_at?->toIso8601String(),
            'shipped_at'     => $order->shipped_at?->toIso8601String(),
            'delivered_at'   => $order->delivered_at?->toIso8601String(),
            'timeline'       => $order->timeline(),
            'items'          => $order->items->load('artwork')->map(fn ($item) => [
                'id'      => $item->id,
                'price'   => $item->price,
                'artwork' => $item->artwork ? [
                    'title'  => $item->artwork->title,
                    'artist' => $item->artwork->artist,
                    'image'  => $item->artwork->image,
                ] : null,
            ]),
        ];

        return Inertia::render('Orders/Show', ['order' => $data]);
    }

    // ── ADMIN ─────────────────────────────────────────────────────

    public function adminIndex()
    {
        $orders = Order::with('user', 'items.artwork')
            ->latest()
            ->get()
            ->map(fn ($order) => [
                'id'             => $order->id,
                'user'           => $order->user?->name,
                'email'          => $order->user?->email,
                'total'          => $order->total,
                'status'         => $order->status,
                'full_name'      => $order->full_name,
                'phone'          => $order->phone,
                'address'        => $order->address,
                'payment_method' => $order->payment_method,
                'tracking_note'  => $order->tracking_note,
                'created_at'     => $order->created_at->format('M d, Y'),
                'timeline'       => $order->timeline(),
                'items'          => $order->items->map(fn ($item) => [
                    'price'   => $item->price,
                    'artwork' => $item->artwork?->title,
                ]),
            ]);

        return Inertia::render('Admin/Orders/Index', compact('orders'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,shipped,delivered,cancelled',
            'note'   => 'nullable|string|max:500',
        ]);

        $timestamps = [
            'confirmed' => 'confirmed_at',
            'shipped'   => 'shipped_at',
            'delivered' => 'delivered_at',
            'cancelled' => 'cancelled_at',
        ];

        $updates = ['status' => $request->status];

        if ($request->filled('note')) {
            $updates['tracking_note'] = $request->note;
        }

        if (isset($timestamps[$request->status]) && !$order->{$timestamps[$request->status]}) {
            $updates[$timestamps[$request->status]] = now();
        }

        $order->update($updates);

        return back()->with('success', "Order #{$order->id} status updated to {$request->status}.");
    }

    // ── BUYER ─────────────────────────────────────────────────────

    /**
     * Buyer deletes a delivered or cancelled order from their history.
     * Route: DELETE /orders/{order}
     */
    public function destroy(Request $request, Order $order)
    {
        // Only the buyer (order owner) can delete their own order
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        // Only allow deleting delivered or cancelled orders
        if (!in_array($order->status, ['delivered', 'cancelled'])) {
            return back()->with('error', 'Only delivered or cancelled orders can be deleted.');
        }

        $order->delete();

        return back()->with('success', 'Order removed from your history.');
    }

    // ── OWNER ─────────────────────────────────────────────────────

    public function accept(Request $request, Order $order)
    {
        $artworkOwnerId = $order->items()->with('artwork')->first()?->artwork?->user_id;

        if ($artworkOwnerId !== $request->user()->id) {
            abort(403);
        }

        if ($order->status !== 'pending') {
            return back()->with('error', 'This order cannot be accepted.');
        }

        $order->update([
            'status'       => 'confirmed',
            'confirmed_at' => now(),
        ]);

        return back()->with('success', 'Order accepted!');
    }

    public function decline(Request $request, Order $order)
    {
        $artworkOwnerId = $order->items()->with('artwork')->first()?->artwork?->user_id;

        if ($artworkOwnerId !== $request->user()->id) {
            abort(403);
        }

        if ($order->status !== 'pending') {
            return back()->with('error', 'This order cannot be declined.');
        }

        $order->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);

        foreach ($order->items as $item) {
            $item->artwork?->update(['status' => 'available']);
        }

        return redirect("/products/{$order->items->first()->artwork_id}")
            ->with('success', 'Order declined. Artwork is now available again.');
    }

    public function ship(Request $request, Order $order)
    {
        $artworkOwnerId = $order->items()->with('artwork')->first()?->artwork?->user_id;

        if ($artworkOwnerId !== $request->user()->id) {
            abort(403);
        }

        if ($order->status !== 'confirmed') {
            return back()->with('error', 'Order must be confirmed before shipping.');
        }

        $order->update([
            'status'    => 'shipped',
            'shipped_at' => now(),
        ]);

        return back()->with('success', 'Order marked as shipped!');
    }

    public function deliver(Request $request, Order $order)
    {
        $artworkOwnerId = $order->items()->with('artwork')->first()?->artwork?->user_id;

        if ($artworkOwnerId !== $request->user()->id) {
            abort(403);
        }

        if ($order->status !== 'shipped') {
            return back()->with('error', 'Order must be shipped before marking as delivered.');
        }

        $order->update([
            'status'       => 'delivered',
            'delivered_at' => now(),
        ]);

        // Mark artwork as sold once delivered
        foreach ($order->items as $item) {
            $item->artwork?->update(['status' => 'sold']);
        }

        return back()->with('success', 'Order marked as delivered!');
    }
}