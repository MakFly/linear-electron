<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    private const PROVIDERS = ['google', 'github'];

    public function redirect(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::PROVIDERS), 404);

        if (! config("services.$provider.client_id")) {
            return redirect()
                ->route('login')
                ->withErrors(['email' => ucfirst($provider).' SSO is not configured. Set the keys in your .env file.']);
        }

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Mock login for local development: signs in a demo account instantly,
     * no credentials or OAuth keys required.
     */
    public function mock(): RedirectResponse
    {
        $user = User::firstOrCreate(
            ['email' => 'kevin@devaubree.dev'],
            ['name' => 'kevin', 'provider' => 'mock', 'email_verified_at' => now()],
        );

        Auth::login($user, remember: true);

        return redirect()->intended('/team/DEV/active');
    }

    public function callback(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::PROVIDERS), 404);

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Throwable) {
            return redirect()
                ->route('login')
                ->withErrors(['email' => 'Authentication with '.ucfirst($provider).' failed. Please try again.']);
        }

        $user = User::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if (! $user) {
            // Link by email if an account already exists, otherwise create one.
            $user = User::where('email', $socialUser->getEmail())->first();

            if ($user) {
                $user->update([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                ]);
            } else {
                $user = User::create([
                    'name' => $socialUser->getName() ?: ($socialUser->getNickname() ?: Str::before($socialUser->getEmail(), '@')),
                    'email' => $socialUser->getEmail(),
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                    'email_verified_at' => now(),
                ]);
            }
        }

        Auth::login($user, remember: true);

        return redirect()->intended('/team/DEV/active');
    }
}
