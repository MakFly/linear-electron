<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Label;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LabelsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('settings/labels', [
            'labels' => Label::withCount('issues')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:64|unique:labels,name',
            'color' => 'required|string|max:24',
        ]);

        Label::create($data);

        return back();
    }

    public function destroy(Label $label): RedirectResponse
    {
        $label->delete();

        return back();
    }
}
