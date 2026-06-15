<?php

use App\Http\Controllers\Settings\LabelsController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\PreferencesController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/account/preferences');
    Route::redirect('settings/account', 'settings/account/preferences');

    /* -------------------------------------------------------------------- */
    /* Personal — /settings/account/* */
    /* -------------------------------------------------------------------- */
    Route::get('settings/account/preferences', [PreferencesController::class, 'edit'])->name('settings.preferences');
    Route::patch('settings/account/preferences', [PreferencesController::class, 'update'])->name('settings.preferences.update');

    Route::get('settings/account/profile', fn () => Inertia::render('settings/profile'))->name('profile.edit');
    Route::patch('settings/account/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/account/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/account/password', fn () => Inertia::render('settings/placeholder', ['titleKey' => 'settings.starterNav.password']))->name('password.edit');
    Route::put('settings/account/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/account/appearance', fn () => redirect()->route('settings.preferences'))->name('appearance');

    /* -------------------------------------------------------------------- */
    /* Issues — /settings/issues/* (labels are DB-backed via controller) */
    /* -------------------------------------------------------------------- */
    Route::get('settings/issues/labels', [LabelsController::class, 'index'])->name('settings.labels');
    Route::post('settings/issues/labels', [LabelsController::class, 'store'])->name('settings.labels.store');
    Route::delete('settings/issues/labels/{label}', [LabelsController::class, 'destroy'])->name('settings.labels.destroy');

    /* -------------------------------------------------------------------- */
    /* Your teams — static team routes declared before any other map */
    /* -------------------------------------------------------------------- */
    Route::get('settings/teams/new', fn () => Inertia::render('settings/create-team'));
    Route::get('settings/teams/DEV', fn () => Inertia::render('settings/team-detail'));

    /* -------------------------------------------------------------------- */
    /* Remaining pages: url path (grouped) => Inertia component name */
    /* -------------------------------------------------------------------- */
    $pages = [
        'account/notifications' => 'notifications',
        'account/code-and-reviews' => 'code-and-reviews',
        'account/security-and-access' => 'security-and-access',
        'account/connected-accounts' => 'connected-accounts',
        'account/agent-personalization' => 'agent-personalization',
        'issues/templates' => 'issue-templates',
        'issues/sla' => 'sla',
        'projects/labels' => 'project-labels',
        'projects/templates' => 'project-templates',
        'projects/statuses' => 'project-statuses',
        'projects/updates' => 'project-updates',
        'features/ai' => 'ai',
        'features/initiatives' => 'initiatives',
        'features/documents' => 'documents',
        'features/customer-requests' => 'customer-requests',
        'features/releases' => 'releases',
        'features/pulse' => 'pulse',
        'features/asks' => 'asks',
        'features/emojis' => 'emojis',
        'features/integrations' => 'integrations',
        'administration/workspace' => 'workspace',
        'administration/teams' => 'teams',
        'administration/members' => 'members',
        'administration/security' => 'security',
        'administration/api' => 'api',
        'administration/applications' => 'applications',
        'administration/billing' => 'billing',
        'administration/import-export' => 'import-export',
    ];

    foreach ($pages as $path => $component) {
        Route::get("settings/{$path}", fn () => Inertia::render("settings/{$component}"));
    }
});
