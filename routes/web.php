<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\ArtworkController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Auth\PasswordResetOtpController;

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

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::post('artworks/{artwork}/save', [DashboardController::class, 'toggleSave'])->name('artworks.save');
    Route::delete('artworks/{artwork}/save', [DashboardController::class, 'removeSaved'])->name('artworks.unsave');

    Route::get('products', [ArtworkController::class, 'index'])->name('products.index');
    Route::get('products/create', [ArtworkController::class, 'create'])->name('products.create');
    Route::post('products', [ArtworkController::class, 'store'])->name('products.store');

    Route::inertia('products/categories', 'products/categories')->name('products.categories');
    Route::inertia('products/archived', 'products/archived')->name('products.archived');
});

require __DIR__.'/settings.php';