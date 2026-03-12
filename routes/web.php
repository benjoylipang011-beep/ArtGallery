<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\ArtworkController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\PasswordResetOtpController;
use App\Http\Controllers\Auth\SocialAuthController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// ── OTP password reset (bypasses Fortify's link-based reset) ──────────────────
Route::post('forgot-password/otp', [PasswordResetOtpController::class, 'send'])
    ->middleware('guest')
    ->name('password.otp.send');

Route::post('forgot-password/otp/verify', [PasswordResetOtpController::class, 'verify'])
    ->middleware('guest')
    ->name('password.otp.verify');

Route::post('forgot-password/otp/reset', [PasswordResetOtpController::class, 'reset'])
    ->middleware('guest')
    ->name('password.otp.reset');

// ── Social OAuth (Google & Facebook via Laravel Socialite) ────────────────────
Route::middleware('guest')->group(function () {
    Route::get('auth/google/redirect',   [SocialAuthController::class, 'redirectToGoogle'])->name('auth.google.redirect');
    Route::get('auth/google/callback',   [SocialAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');
    Route::get('auth/facebook/redirect', [SocialAuthController::class, 'redirectToFacebook'])->name('auth.facebook.redirect');
    Route::get('auth/facebook/callback', [SocialAuthController::class, 'handleFacebookCallback'])->name('auth.facebook.callback');
});

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Profile ───────────────────────────────────────────────────────────────
    Route::get('/profile',  [ProfileController::class, 'show'])->name('profile.show');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::post('artworks/{artwork}/save', [DashboardController::class, 'toggleSave'])->name('artworks.save');
    Route::delete('artworks/{artwork}/save', [DashboardController::class, 'removeSaved'])->name('artworks.unsave');

    // ── Products / Artworks ───────────────────────────────────────────────────
    Route::get('products',        [ArtworkController::class, 'index'])->name('products.index');
    Route::get('products/create', [ArtworkController::class, 'create'])->name('products.create');
    Route::post('products',       [ArtworkController::class, 'store'])->name('products.store');

    // Static pages MUST come before the {artwork} wildcard
    Route::get('products/categories',         [CategoryController::class, 'index'])->name('products.categories');
    Route::post('products/categories',        [CategoryController::class, 'store'])->name('products.categories.store');
    Route::put('products/categories/{category}',    [CategoryController::class, 'update'])->name('products.categories.update');
    Route::delete('products/categories/{category}', [CategoryController::class, 'destroy'])->name('products.categories.destroy');
    Route::get('products/categories/list',    [CategoryController::class, 'list'])->name('products.categories.list');
    Route::inertia('products/archived',       'products/archived')->name('products.archived');

    // Wildcard routes last so they don't swallow the static ones above
    Route::get('products/{artwork}',    [ArtworkController::class, 'show'])->name('products.show');
    Route::delete('products/{artwork}', [ArtworkController::class, 'destroy'])->name('products.destroy');

    // ── Cart ─────────────────────────────────────────────────────────────────
    Route::get('/cart/count',        [CartController::class, 'count'])->name('cart.count');
    Route::get('/cart',              [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart',             [CartController::class, 'store'])->name('cart.store');
    Route::delete('/cart/{artwork}', [CartController::class, 'destroy'])->name('cart.destroy');

    // Checkout
    Route::get('/cart/checkout',   [CartController::class, 'checkout'])->name('cart.checkout');
    Route::post('/cart/order',     [CartController::class, 'placeOrder'])->name('cart.order');

    // Buy Now
    Route::get('/cart/buy-now',        [CartController::class, 'buyNow'])->name('cart.buy-now');
    Route::post('/cart/buy-now/place', [CartController::class, 'placeBuyNow'])->name('cart.buy-now.place');

    // ── Orders ────────────────────────────────────────────────────────────────
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');

    // ── Admin: Order status management ────────────────────────────────────────
    Route::patch('/admin/orders/{order}/status', [OrderController::class, 'updateStatus'])
        ->name('admin.orders.status');
    Route::get('/admin/orders', [OrderController::class, 'adminIndex'])
        ->name('admin.orders.index');

});

require __DIR__.'/settings.php';