<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    // ── Google ────────────────────────────────────────────────────────────────

    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        return $this->handleCallback('google');
    }

    // ── Facebook ──────────────────────────────────────────────────────────────

    public function redirectToFacebook()
    {
        return Socialite::driver('facebook')->redirect();
    }

    public function handleFacebookCallback()
    {
        return $this->handleCallback('facebook');
    }

    // ── Shared callback logic ─────────────────────────────────────────────────

    private function handleCallback(string $provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return redirect()->route('home')
                ->withErrors(['social' => "Could not authenticate with {$provider}. Please try again."]);
        }

        // Find existing user by provider ID, or fall back to email match
        $user = User::where('provider', $provider)
                    ->where('provider_id', $socialUser->getId())
                    ->first();

        if (! $user) {
            $user = User::where('email', $socialUser->getEmail())->first();

            if ($user) {
                // Link existing account to this social provider
                $user->update([
                    'provider'       => $provider,
                    'provider_id'    => $socialUser->getId(),
                    'provider_token' => $socialUser->token,
                ]);
            } else {
                // Create a brand-new user
                $user = User::create([
                    'name'           => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                    'email'          => $socialUser->getEmail(),
                    'password'       => bcrypt(Str::random(32)), // unusable password
                    'provider'       => $provider,
                    'provider_id'    => $socialUser->getId(),
                    'provider_token' => $socialUser->token,
                    'email_verified_at' => now(), // OAuth email is already verified
                ]);
            }
        } else {
            // Refresh the token on every login
            $user->update(['provider_token' => $socialUser->token]);
        }

        Auth::login($user, remember: true);

        return redirect()->intended(route('dashboard'));
    }
}