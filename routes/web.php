<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Products routes
    Route::inertia('products', 'products/index')->name('products.index');
    Route::inertia('products/create', 'products/create')->name('products.create');
    Route::inertia('products/categories', 'products/categories')->name('products.categories');
    Route::inertia('products/archived', 'products/archived')->name('products.archived');
});

require __DIR__.'/settings.php';