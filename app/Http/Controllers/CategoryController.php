<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('artworks')->orderBy('name')->get();

        return Inertia::render('products/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string|max:1000',
        ]);

        Category::create($request->only('name', 'description'));

        return back();
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $category->update($request->only('name', 'description'));

        return back();
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return back();
    }

    // For sidebar dynamic list
    public function list()
    {
        $categories = Category::withCount('artworks')->orderBy('name')->get();

        return response()->json(['categories' => $categories]);
    }
}