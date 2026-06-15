<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PreferencesController extends Controller
{
    public const DEFAULTS = [
        'default_home_view' => 'active',
        'display_names' => 'full',
        'first_day_of_week' => 'monday',
        'convert_emoticons' => true,
        'send_comment_on' => 'enter',
        'font_size' => 'default',
        'pointer_cursors' => false,
        'interface_theme' => 'dark',
        'open_in_desktop_app' => false,
        'language' => 'en',
    ];

    public function edit(Request $request): Response
    {
        return Inertia::render('settings/preferences', [
            'preferences' => $this->preferences($request),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'default_home_view' => ['sometimes', Rule::in(['active', 'my-issues', 'inbox'])],
            'display_names' => ['sometimes', Rule::in(['full', 'short', 'username'])],
            'first_day_of_week' => ['sometimes', Rule::in(['sunday', 'monday'])],
            'convert_emoticons' => ['sometimes', 'boolean'],
            'send_comment_on' => ['sometimes', Rule::in(['enter', 'mod-enter'])],
            'font_size' => ['sometimes', Rule::in(['small', 'default', 'large'])],
            'pointer_cursors' => ['sometimes', 'boolean'],
            'interface_theme' => ['sometimes', Rule::in(['light', 'dark', 'system'])],
            'open_in_desktop_app' => ['sometimes', 'boolean'],
            'language' => ['sometimes', Rule::in(['en', 'fr'])],
        ]);

        $request->user()->forceFill([
            'preferences' => [
                ...self::DEFAULTS,
                ...($request->user()->preferences ?? []),
                ...$validated,
            ],
        ])->save();

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function preferences(Request $request): array
    {
        return [
            ...self::DEFAULTS,
            ...($request->user()->preferences ?? []),
        ];
    }
}
