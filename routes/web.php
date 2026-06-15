<?php

use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\IssueController;
use App\Http\Controllers\Settings\PreferencesController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $homeView = auth()->user()?->preferences['default_home_view'] ?? PreferencesController::DEFAULTS['default_home_view'];

    return redirect(match ($homeView) {
        'my-issues' => '/my-issues',
        'inbox' => '/inbox',
        default => '/team/DEV/active',
    });
})->name('home');

Route::middleware('guest')->group(function () {
    Route::post('/auth/mock', [SocialAuthController::class, 'mock'])->name('social.mock');
    Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])->name('social.redirect');
    Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])->name('social.callback');
});

Route::middleware('auth')->group(function () {
    Route::get('/inbox', [IssueController::class, 'inbox'])->name('inbox');
    Route::get('/my-issues', [IssueController::class, 'myIssues'])->name('my-issues');
    Route::get('/projects', [IssueController::class, 'projects'])->name('workspace.projects');
    Route::post('/projects', [IssueController::class, 'storeProject'])->name('projects.store');
    Route::get('/views', [IssueController::class, 'views'])->name('workspace.views');
    Route::get('/team/DEV/projects', [IssueController::class, 'projects'])->name('projects');
    Route::get('/team/DEV/projects/{project}', [IssueController::class, 'project'])->name('projects.show');
    Route::get('/team/DEV/views', [IssueController::class, 'views'])->name('views');
    Route::get('/team/DEV/{view?}', [IssueController::class, 'index'])->name('issues.index');
    Route::get('/issue/{identifier}', [IssueController::class, 'show'])->name('issues.show');
    Route::post('/issues', [IssueController::class, 'store'])->name('issues.store');
    Route::patch('/issues-reorder', [IssueController::class, 'reorder'])->name('issues.reorder');
    Route::patch('/issues-bulk', [IssueController::class, 'bulkUpdate'])->name('issues.bulk-update');
    Route::post('/issues-bulk-delete', [IssueController::class, 'bulkDestroy'])->name('issues.bulk-destroy');
    Route::patch('/issues/{issue}', [IssueController::class, 'update'])->name('issues.update');
    Route::delete('/issues/{issue}', [IssueController::class, 'destroy'])->name('issues.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
