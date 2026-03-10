<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Artwork;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CartController extends Controller
{
    // Cart count for sidebar badge
    public function count()
    {
        $count = CartItem::where('user_id', Auth::id())->count();
        return response()->json(['count' => $count]);
    }

    // Show cart page
    public function index()
    {
        $cartItems = CartItem::with('artwork')
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        $total = $cartItems->sum(fn($item) => $item->artwork->price ?? 0);

        return Inertia::render('cart/index', [
            'cartItems' => $cartItems,
            'total'     => $total,
            'cartCount' => $cartItems->count(),
        ]);
    }

    // Add to cart
    public function store(Request $request)
    {
        $request->validate(['artwork_id' => 'required|exists:artworks,id']);

        $artwork = Artwork::findOrFail($request->artwork_id);

        // Can't add your own artwork
        if ($artwork->user_id === Auth::id()) {
            return back()->with('error', 'You cannot add your own artwork to cart.');
        }

        // Can't add sold/reserved artwork
        if (in_array($artwork->status, ['sold', 'reserved'])) {
            return back()->with('error', 'This artwork is no longer available.');
        }

        CartItem::firstOrCreate([
            'user_id'    => Auth::id(),
            'artwork_id' => $request->artwork_id,
        ]);

        return back()->with('success', 'Added to cart!');
    }

    // Remove from cart
    public function destroy($artworkId)
    {
        CartItem::where('user_id', Auth::id())
            ->where('artwork_id', $artworkId)
            ->delete();

        return back()->with('success', 'Removed from cart.');
    }

    // Show checkout page
    public function checkout()
    {
        $cartItems = CartItem::with('artwork')
            ->where('user_id', Auth::id())
            ->get();

        if ($cartItems->isEmpty()) {
            return redirect('/cart')->with('error', 'Your cart is empty.');
        }

        $total = $cartItems->sum(fn($item) => $item->artwork->price ?? 0);

        return Inertia::render('cart/checkout', [
            'cartItems' => $cartItems,
            'total'     => $total,
        ]);
    }

    // Place order from cart
    public function placeOrder(Request $request)
    {
        $request->validate([
            'full_name'      => 'required|string|max:255',
            'phone'          => 'required|string|max:20',
            'address'        => 'required|string',
            'payment_method' => 'required|in:cash_on_delivery,gcash',
        ]);

        $cartItems = CartItem::with('artwork')
            ->where('user_id', Auth::id())
            ->get();

        if ($cartItems->isEmpty()) {
            return back()->with('error', 'Your cart is empty.');
        }

        DB::transaction(function () use ($request, $cartItems) {
            $total = $cartItems->sum(fn($item) => $item->artwork->price ?? 0);

            $order = Order::create([
                'user_id'        => Auth::id(),
                'total'          => $total,
                'status'         => 'pending',
                'full_name'      => $request->full_name,
                'phone'          => $request->phone,
                'address'        => $request->address,
                'payment_method' => $request->payment_method,
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'artwork_id' => $item->artwork_id,
                    'price'      => $item->artwork->price ?? 0,
                ]);

                // Mark artwork as reserved
                $item->artwork->update(['status' => 'reserved']);
            }

            // Clear cart
            CartItem::where('user_id', Auth::id())->delete();
        });

        return redirect('/orders')->with('success', 'Order placed successfully!');
    }

    // Buy Now — GET page, artwork_id passed as query param
    public function buyNow(Request $request)
    {
        $request->validate(['artwork_id' => 'required|exists:artworks,id']);

        $artwork = Artwork::findOrFail($request->artwork_id);

        if ($artwork->user_id === Auth::id()) {
            return redirect('/products/' . $artwork->id)->with('error', 'You cannot buy your own artwork.');
        }

        if (in_array($artwork->status, ['sold', 'reserved'])) {
            return redirect('/products/' . $artwork->id)->with('error', 'This artwork is no longer available.');
        }

        return Inertia::render('cart/buy-now', [
            'artwork' => $artwork,
        ]);
    }

    // Place Buy Now order
    public function placeBuyNow(Request $request)
    {
        $request->validate([
            'artwork_id'     => 'required|exists:artworks,id',
            'full_name'      => 'required|string|max:255',
            'phone'          => 'required|string|max:20',
            'address'        => 'required|string',
            'payment_method' => 'required|in:cash_on_delivery,gcash',
        ]);

        $artwork = Artwork::findOrFail($request->artwork_id);

        if ($artwork->user_id === Auth::id()) {
            return back()->with('error', 'You cannot buy your own artwork.');
        }

        DB::transaction(function () use ($request, $artwork) {
            $order = Order::create([
                'user_id'        => Auth::id(),
                'total'          => $artwork->price ?? 0,
                'status'         => 'pending',
                'full_name'      => $request->full_name,
                'phone'          => $request->phone,
                'address'        => $request->address,
                'payment_method' => $request->payment_method,
            ]);

            OrderItem::create([
                'order_id'   => $order->id,
                'artwork_id' => $artwork->id,
                'price'      => $artwork->price ?? 0,
            ]);

            $artwork->update(['status' => 'reserved']);
        });

        return redirect('/orders')->with('success', 'Order placed successfully!');
    }

    // Orders history
    public function orders()
    {
        $orders = Order::with('items.artwork')
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return Inertia::render('cart/orders', [
            'orders' => $orders,
        ]);
    }
}