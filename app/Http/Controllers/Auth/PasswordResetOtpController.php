<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetOtp;
use App\Models\User;
use App\Notifications\PasswordResetOtpNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rules\Password;

class PasswordResetOtpController extends Controller
{
    /**
     * Send a 6-digit OTP to the given email.
     * POST /forgot-password/otp
     */
    public function send(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Rate-limit: max 3 OTP requests per email per 10 minutes
        $key = 'otp-send:' . $request->email;
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'errors' => [
                    'email' => ["Too many requests. Please wait {$seconds} seconds before trying again."],
                ],
            ], 422);
        }

        // ✅ FIX: Check if the email exists BEFORE sending OTP
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'errors' => [
                    'email' => ['No account found with this email address.'],
                ],
            ], 422);
        }

        // Only increment rate limiter after confirming user exists
        RateLimiter::increment($key, 600);

        // Delete any existing OTP for this email, then create a fresh one
        PasswordResetOtp::where('email', $request->email)->delete();

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        PasswordResetOtp::create([
            'email'      => $request->email,
            'otp'        => $otp,
            'expires_at' => now()->addMinutes(10),
        ]);

        $user->notify(new PasswordResetOtpNotification($otp));

        return response()->json([
            'message' => 'A 6-digit reset code has been sent to your email.',
        ]);
    }

    /**
     * Verify OTP only (no password change yet) — called from the Verify Code button.
     * POST /forgot-password/otp/verify
     */
    public function verify(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp'   => ['required', 'string', 'size:6'],
        ]);

        $key = 'otp-verify:' . $request->email;
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'errors' => ['otp' => ["Too many attempts. Please wait {$seconds} seconds."]],
            ], 422);
        }

        $record = PasswordResetOtp::where('email', $request->email)
            ->where('otp', $request->otp)
            ->first();

        if (! $record) {
            RateLimiter::increment($key, 900);
            return response()->json([
                'errors' => ['otp' => ['Invalid code. Please check your email and try again.']],
            ], 422);
        }

        if ($record->isExpired()) {
            $record->delete();
            return response()->json([
                'errors' => ['otp' => ['This code has expired. Please request a new one.']],
            ], 422);
        }

        // Code is valid — clear rate limit and let frontend show password fields
        RateLimiter::clear($key);

        return response()->json(['message' => 'OTP verified.']);
    }

    /**
     * Verify OTP and reset the password.
     * POST /forgot-password/otp/reset
     */
    public function reset(Request $request)
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'otp'      => ['required', 'string', 'size:6'],
            'password' => ['required', 'confirmed', Password::min(6)],
        ]);

        $key = 'otp-verify:' . $request->email;
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'errors' => ['otp' => ["Too many attempts. Please wait {$seconds} seconds."]],
            ], 422);
        }

        $record = PasswordResetOtp::where('email', $request->email)
            ->where('otp', $request->otp)
            ->first();

        if (! $record) {
            RateLimiter::increment($key, 900);
            return response()->json([
                'errors' => ['otp' => ['Invalid code. Please check your email and try again.']],
            ], 422);
        }

        if ($record->isExpired()) {
            $record->delete();
            return response()->json([
                'errors' => ['otp' => ['This code has expired. Please request a new one.']],
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'errors' => ['email' => ['No account found with this email.']],
            ], 422);
        }

        $user->forceFill(['password' => Hash::make($request->password)])->save();

        $record->delete();
        RateLimiter::clear($key);
        RateLimiter::clear('otp-send:' . $request->email);

        return response()->json(['message' => 'Password reset successfully.']);
    }
}