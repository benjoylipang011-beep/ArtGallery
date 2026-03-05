<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

// ─────────────────────────────────────────────
// Public routes
// ─────────────────────────────────────────────
Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Override Fortify's auth views — must be defined here
// so Laravel picks these up before Fortify's internal routes
Route::get('/login', function () {
    return inertia('auth/auth', [
        'startTab'         => 'login',
        'canResetPassword' => true,
        'canRegister'      => Features::enabled(Features::registration()),
    ]);
})->name('login')->middleware('guest');

Route::get('/register', function () {
    return inertia('auth/auth', [
        'startTab'    => 'register',
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('register')->middleware('guest');

// ─────────────────────────────────────────────
// Authenticated routes
// ─────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Products routes
    Route::inertia('products', 'products/index')->name('products.index');
    Route::inertia('products/create', 'products/create')->name('products.create');
    Route::inertia('products/categories', 'products/categories')->name('products.categories');
    Route::inertia('products/archived', 'products/archived')->name('products.archived');
});

require __DIR__.'/settings.php';