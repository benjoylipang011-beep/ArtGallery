<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use App\Models\CartItem;
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
        $inCart = CartItem::where('user_id', Auth::id())
            ->where('artwork_id', $artwork->id)
            ->exists();

        $isSaved = SavedArtwork::where('user_id', Auth::id())
            ->where('artwork_id', $artwork->id)
            ->exists();

        $savedAt = SavedArtwork::where('user_id', Auth::id())
            ->where('artwork_id', $artwork->id)
            ->value('created_at');

        return Inertia::render('products/show', [
            'artwork'    => array_merge($artwork->toArray(), ['user_id' => (int) $artwork->user_id]),
            'authUserId' => (int) Auth::id(),
            'inCart'     => $inCart,
            'isSaved'    => $isSaved,
            'savedAt'    => $savedAt ? $savedAt->toIso8601String() : null,
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