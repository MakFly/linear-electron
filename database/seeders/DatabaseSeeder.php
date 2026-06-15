<?php

namespace Database\Seeders;

use App\Models\Cycle;
use App\Models\Issue;
use App\Models\IssueRelation;
use App\Models\Label;
use App\Models\Project;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $labels = collect([
            ['name' => 'Frontend', 'color' => '#8B5CF6'],
            ['name' => 'Backend', 'color' => '#10B981'],
            ['name' => 'Bug', 'color' => '#EF4444'],
            ['name' => 'Design', 'color' => '#F59E0B'],
        ])->mapWithKeys(fn (array $label) => [$label['name'] => Label::create($label)]);

        $project = Project::create([
            'name' => 'Linear clone parity',
            'description' => 'Bring the local NativePHP app closer to the production Linear workflow.',
            'status' => 'active',
            'lead' => 'kevin',
            'start_date' => '2026-06-10',
            'target_date' => '2026-06-24',
            'icon' => 'box',
            'color' => '#5E6AD2',
        ]);

        $cycles = collect([
            ['number' => 18, 'starts_at' => '2026-06-08', 'ends_at' => '2026-06-21', 'team' => Issue::TEAM_PREFIX],
            ['number' => 19, 'starts_at' => '2026-06-22', 'ends_at' => '2026-07-05', 'team' => Issue::TEAM_PREFIX],
        ])->mapWithKeys(fn (array $cycle) => [$cycle['number'] => Cycle::create($cycle)]);

        $issues = collect([
            [
                'title' => 'Get familiar with Linear',
                'description' => 'Explore the issue list, command palette, sheet, and settings spaces.',
                'status' => 'done',
                'priority' => 4,
                'assignee' => 'kevin',
                'labels' => ['Design'],
                'cycle' => 18,
                'estimate' => 1,
                'completed_at' => '2026-06-11 16:00:00',
            ],
            [
                'title' => 'Set up your teams',
                'description' => 'Create the DEV team shell and match the sidebar navigation.',
                'status' => 'in_progress',
                'priority' => 2,
                'assignee' => 'kevin',
                'labels' => ['Frontend', 'Backend'],
                'cycle' => 18,
                'estimate' => 3,
                'started_at' => '2026-06-12 09:30:00',
            ],
            [
                'title' => 'Connect your tools',
                'description' => 'Wire settings, issue metadata, and browser verification into the app workflow.',
                'status' => 'todo',
                'priority' => 3,
                'assignee' => null,
                'labels' => ['Backend'],
                'cycle' => 18,
                'estimate' => 2,
                'due_date' => '2026-06-17',
            ],
            [
                'title' => 'Import your data',
                'description' => 'Seed realistic projects, cycles, labels, and linked issues.',
                'status' => 'backlog',
                'priority' => 0,
                'assignee' => null,
                'labels' => ['Frontend'],
                'cycle' => 19,
                'estimate' => 5,
                'due_date' => '2026-06-28',
            ],
            [
                'title' => 'Fix compact settings mobile layout',
                'description' => 'Keep settings usable on narrow native windows.',
                'status' => 'done',
                'priority' => 1,
                'assignee' => 'kevin',
                'labels' => ['Bug', 'Frontend'],
                'cycle' => 18,
                'estimate' => 2,
                'parent' => 2,
                'completed_at' => '2026-06-13 11:52:00',
            ],
        ]);

        $created = collect();

        foreach ($issues as $i => $data) {
            $issue = Issue::create([
                'number' => $i + 1,
                'sort_order' => ($i + 1) * 1000,
                'title' => $data['title'],
                'description' => $data['description'],
                'status' => $data['status'],
                'priority' => $data['priority'],
                'assignee' => $data['assignee'],
                'project_id' => $project->id,
                'cycle_id' => $cycles[$data['cycle']]->id,
                'parent_id' => isset($data['parent']) ? $created[$data['parent']]->id : null,
                'due_date' => $data['due_date'] ?? null,
                'estimate' => $data['estimate'],
                'started_at' => $data['started_at'] ?? null,
                'completed_at' => $data['completed_at'] ?? null,
                'created_at' => '2026-04-11 09:00:00',
            ]);

            $issue->labels()->sync(collect($data['labels'])->map(fn (string $name) => $labels[$name]->id)->all());
            $created[$issue->number] = $issue;
        }

        IssueRelation::create([
            'issue_id' => $created[3]->id,
            'related_issue_id' => $created[4]->id,
            'type' => 'blocks',
        ]);
    }
}
