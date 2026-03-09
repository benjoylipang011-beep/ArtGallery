<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArtworkController extends Controller
{
    public function index()
    {
        $artworks = Artwork::latest()->get();
        return Inertia::render('products/index', compact('artworks'));
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

        Artwork::create($validated);

        return redirect('/products')->with('success', 'Artwork added!');
    }
}