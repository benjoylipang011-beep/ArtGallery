<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    // ── USER ─────────────────────────────────────────────────────

    /**
     * Show all orders for the authenticated user.
     */
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
                'created_at'     => $order->created_at->format('M d, Y'),
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

    /**
     * Show a single order (user must own it).
     */
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
            'created_at'     => $order->created_at->format('M d, Y h:i A'),
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

    /**
     * Admin: list all orders.
     */
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

    /**
     * Admin: update order status.
     */
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

        // Set the corresponding timestamp if not already set
        if (isset($timestamps[$request->status]) && !$order->{$timestamps[$request->status]}) {
            $updates[$timestamps[$request->status]] = now();
        }

        $order->update($updates);

        return back()->with('success', "Order #{$order->id} status updated to {$request->status}.");
    }
}