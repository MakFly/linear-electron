<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use App\Models\Cycle;
use App\Models\Label;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class IssueController extends Controller
{
    private const VALIDATION = [
        'title' => 'string|max:255',
        'description' => 'nullable|string',
        'status' => 'in:backlog,todo,in_progress,done,canceled',
        'priority' => 'integer|between:0,4',
        'assignee' => 'nullable|string|max:64',
        'project_id' => 'nullable|integer|exists:projects,id',
        'cycle_id' => 'nullable|integer|exists:cycles,id',
        'parent_id' => 'nullable|integer|exists:issues,id',
        'due_date' => 'nullable|date',
        'estimate' => 'nullable|integer|between:1,8',
        'labels' => 'array',
        'labels.*' => 'integer|exists:labels,id',
    ];

    public function index(string $view = 'active'): Response
    {
        abort_unless(in_array($view, ['all', 'active', 'backlog']), 404);

        return Inertia::render('issues', [
            'view' => $view,
            ...$this->issueProps(),
        ]);
    }

    public function show(string $identifier): Response
    {
        $number = (int) str_replace(Issue::TEAM_PREFIX.'-', '', strtoupper($identifier));
        $issue = $this->issueQuery()->where('number', $number)->firstOrFail();

        return Inertia::render('issue-detail', [
            'issue' => $issue,
            ...$this->issueProps(),
        ]);
    }

    public function inbox(): Response
    {
        return Inertia::render('inbox', [
            ...$this->issueProps(),
        ]);
    }

    public function myIssues(): Response
    {
        return Inertia::render('my-issues', [
            ...$this->issueProps(),
        ]);
    }

    public function projects(Request $request): Response
    {
        return Inertia::render('projects', [
            ...$this->issueProps(),
            'scope' => $request->is('team/*') ? 'team' : 'workspace',
        ]);
    }

    public function project(Request $request, Project $project): Response
    {
        return Inertia::render('projects', [
            ...$this->issueProps(),
            'scope' => $request->is('team/*') ? 'team' : 'workspace',
            'selectedProject' => $project->loadCount('issues'),
        ]);
    }

    public function storeProject(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        Project::create([
            ...$data,
            'description' => null,
            'status' => 'planned',
            'lead' => $request->user()?->name,
            'color' => '#5E6AD2',
            'icon' => 'box',
        ]);

        return back();
    }

    public function views(Request $request): Response
    {
        return Inertia::render('views', [
            ...$this->issueProps(),
            'scope' => $request->is('team/*') ? 'team' : 'workspace',
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(array_merge(self::VALIDATION, [
            'title' => 'required|string|max:255',
            'status' => 'required|in:backlog,todo,in_progress,done,canceled',
        ]));

        $issue = Issue::create([
            ...Arr::except($data, ['labels']),
            'number' => Issue::nextNumber(),
            'sort_order' => ((int) Issue::where('status', $data['status'])->max('sort_order')) + 1000,
        ]);
        $issue->labels()->sync($data['labels'] ?? []);

        return back();
    }

    public function update(Request $request, Issue $issue)
    {
        $rules = [];
        foreach (self::VALIDATION as $field => $rule) {
            $rules[$field] = "sometimes|$rule";
        }

        $data = $request->validate($rules);

        if (($data['parent_id'] ?? null) === $issue->id) {
            $data['parent_id'] = null;
        }

        $labels = $data['labels'] ?? null;
        $fields = Arr::except($data, ['labels']);

        $issue->update($this->withStatusTimestamps($issue, $fields));

        if (is_array($labels)) {
            $issue->labels()->sync($labels);
        }

        return back();
    }

    public function reorder(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|distinct|exists:issues,id',
            'status' => 'sometimes|in:backlog,todo,in_progress,done,canceled',
            'priority' => 'sometimes|integer|between:0,4',
            'project_id' => 'sometimes|nullable|integer|exists:projects,id',
            'cycle_id' => 'sometimes|nullable|integer|exists:cycles,id',
        ]);

        $ids = array_values($data['ids']);
        $fields = collect($data)->only(['status', 'priority', 'project_id', 'cycle_id'])->all();

        DB::transaction(function () use ($ids, $fields): void {
            $issues = Issue::whereIn('id', $ids)->get()->keyBy('id');

            foreach ($ids as $index => $id) {
                $issue = $issues->get($id);

                if (!$issue instanceof Issue) {
                    continue;
                }

                $issue->update($this->withStatusTimestamps($issue, [
                    ...$fields,
                    'sort_order' => ($index + 1) * 1000,
                ]));
            }
        });

        return back();
    }

    public function destroy(Request $request, Issue $issue)
    {
        $issue->delete();

        return $request->boolean('redirect') ? redirect('/team/DEV/active') : back();
    }

    public function bulkUpdate(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:issues,id',
            'status' => 'sometimes|in:backlog,todo,in_progress,done,canceled',
            'priority' => 'sometimes|integer|between:0,4',
            'assignee' => 'sometimes|nullable|string|max:64',
        ]);

        $fields = collect($data)->only(['status', 'priority', 'assignee'])->all();

        if ($fields !== []) {
            Issue::whereIn('id', $data['ids'])->get()->each->update($fields);
        }

        return back();
    }

    public function bulkDestroy(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:issues,id',
        ]);

        Issue::whereIn('id', $data['ids'])->each->delete();

        return back();
    }

    private function issueQuery()
    {
        return Issue::with(['labels', 'project', 'cycle', 'parent', 'children', 'relations.relatedIssue'])
            ->orderBy('sort_order')
            ->orderBy('number');
    }

    /**
     * @param  array<string, mixed>  $fields
     * @return array<string, mixed>
     */
    private function withStatusTimestamps(Issue $issue, array $fields): array
    {
        if (($fields['status'] ?? null) === 'in_progress' && !$issue->started_at) {
            $fields['started_at'] = now();
        }

        if (($fields['status'] ?? null) === 'done' && !$issue->completed_at) {
            $fields['completed_at'] = now();
        }

        return $fields;
    }

    /**
     * @return array<string, mixed>
     */
    private function issueProps(): array
    {
        return [
            'issues' => $this->issueQuery()->get(),
            'labels' => Label::orderBy('name')->get(),
            'projects' => Project::withCount('issues')->orderBy('name')->get(),
            'cycles' => Cycle::orderByDesc('number')->get(),
        ];
    }
}
