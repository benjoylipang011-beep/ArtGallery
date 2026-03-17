<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\SavedArtwork;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ArtworkController extends Controller
{
    public function index()
    {
        $artworks = Artwork::latest()->get();

        $savedIds = Auth::check()
            ? SavedArtwork::where('user_id', Auth::id())->pluck('artwork_id')->toArray()
            : [];

        return Inertia::render('products/index', [
            'artworks'   => $artworks,
            'authUserId' => Auth::id(),
            'savedIds'   => $savedIds,
        ]);
    }

    public function create()
    {
        return Inertia::render('products/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'artist'      => 'required|string|max:255',
            'description' => 'nullable|string',
            'medium'      => 'nullable|string',
            'year'        => 'nullable|integer',
            'dimensions'  => 'nullable|string',
            'price'       => 'nullable|numeric',
            'category'    => 'nullable|string',
            'status'      => 'required|string',
            'image'       => 'nullable|image|max:10240',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('artworks', 'public');
        }

        $validated['user_id'] = Auth::id();

        Artwork::create($validated);

        return redirect('/products')->with('success', 'Artwork added!');
    }

    public function show(Artwork $artwork)
    {
        $authId  = Auth::id();
        $isOwner = $artwork->user_id === $authId;

        $inCart = CartItem::where('user_id', $authId)
            ->where('artwork_id', $artwork->id)
            ->exists();

        $isSaved = SavedArtwork::where('user_id', $authId)
            ->where('artwork_id', $artwork->id)
            ->exists();

        $savedAt = SavedArtwork::where('user_id', $authId)
            ->where('artwork_id', $artwork->id)
            ->value('created_at');

        // Owner sees an order management panel for pending/confirmed/shipped orders
        $pendingOrder = null;
        if ($isOwner && $artwork->status === 'reserved') {
            $order = Order::whereHas('items', fn ($q) => $q->where('artwork_id', $artwork->id))
                ->whereIn('status', ['pending', 'confirmed', 'shipped'])
                ->latest()
                ->first();

            if ($order) {
                $pendingOrder = [
                    'id'             => $order->id,
                    'status'         => $order->status,
                    'buyer_name'     => $order->full_name,
                    'phone'          => $order->phone,
                    'address'        => $order->address,
                    'payment_method' => $order->payment_method,
                    'total'          => $order->total,
                    'created_at'     => $order->created_at->toIso8601String(),
                ];
            }
        }

        return Inertia::render('products/show', [
            'artwork'      => array_merge($artwork->toArray(), ['user_id' => (int) $artwork->user_id]),
            'authUserId'   => (int) $authId,
            'inCart'       => $inCart,
            'isSaved'      => $isSaved,
            'savedAt'      => $savedAt ? $savedAt->toIso8601String() : null,
            'pendingOrder' => $pendingOrder,
        ]);
    }

    public function destroy(Artwork $artwork)
    {
        if ($artwork->user_id !== Auth::id()) {
            abort(403, 'You can only delete your own artworks.');
        }

        // Delete the image file from storage if it exists
        if ($artwork->image) {
            \Storage::disk('public')->delete($artwork->image);
        }

        $artwork->delete();

        return redirect('/products')->with('success', 'Artwork deleted.');
    }
}