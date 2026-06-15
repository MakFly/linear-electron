<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IssueReorderTest extends TestCase
{
    use RefreshDatabase;

    public function test_reorders_issues_in_the_requested_order(): void
    {
        $this->actingAs(User::factory()->create());

        $first = Issue::create([
            'number' => 1,
            'sort_order' => 1000,
            'title' => 'First issue',
            'status' => 'todo',
            'priority' => 2,
        ]);
        $second = Issue::create([
            'number' => 2,
            'sort_order' => 2000,
            'title' => 'Second issue',
            'status' => 'todo',
            'priority' => 3,
        ]);

        $this->patch('/issues-reorder', [
            'ids' => [$second->id, $first->id],
        ])->assertRedirect();

        $this->assertSame([$second->id, $first->id], Issue::orderBy('sort_order')->pluck('id')->all());
        $this->assertSame(1000, $second->fresh()->sort_order);
        $this->assertSame(2000, $first->fresh()->sort_order);
    }

    public function test_moves_an_issue_into_another_status_while_preserving_target_order(): void
    {
        $this->actingAs(User::factory()->create());

        $todo = Issue::create([
            'number' => 1,
            'sort_order' => 1000,
            'title' => 'Todo issue',
            'status' => 'todo',
            'priority' => 2,
        ]);
        $started = Issue::create([
            'number' => 2,
            'sort_order' => 1000,
            'title' => 'Started issue',
            'status' => 'in_progress',
            'priority' => 3,
        ]);

        $this->patch('/issues-reorder', [
            'ids' => [$todo->id, $started->id],
            'status' => 'todo',
        ])->assertRedirect();

        $this->assertSame('todo', $started->fresh()->status);
        $this->assertSame(2000, $started->fresh()->sort_order);
    }

    public function test_all_issues_can_swap_dev_five_and_dev_four_without_changing_statuses(): void
    {
        $this->actingAs(User::factory()->create());

        $done = Issue::create([
            'number' => 5,
            'sort_order' => 5000,
            'title' => 'Fix compact settings mobile layout',
            'status' => 'done',
            'priority' => 1,
        ]);
        $backlog = Issue::create([
            'number' => 4,
            'sort_order' => 4000,
            'title' => 'Import your data',
            'status' => 'backlog',
            'priority' => 0,
        ]);

        $this->patch('/issues-reorder', [
            'ids' => [$done->id, $backlog->id],
        ])->assertRedirect();

        $this->assertSame([$done->id, $backlog->id], Issue::orderBy('sort_order')->pluck('id')->all());
        $this->assertSame('done', $done->fresh()->status);
        $this->assertSame('backlog', $backlog->fresh()->status);
    }

    public function test_dragging_between_status_groups_changes_status_and_orders_the_target_group(): void
    {
        $this->actingAs(User::factory()->create());

        $backlog = Issue::create([
            'number' => 4,
            'sort_order' => 4000,
            'title' => 'Import your data',
            'status' => 'backlog',
            'priority' => 0,
        ]);
        $done = Issue::create([
            'number' => 5,
            'sort_order' => 5000,
            'title' => 'Fix compact settings mobile layout',
            'status' => 'done',
            'priority' => 1,
        ]);

        $this->patch('/issues-reorder', [
            'ids' => [$done->id, $backlog->id],
            'status' => 'backlog',
        ])->assertRedirect();

        $this->assertSame('backlog', $done->fresh()->status);
        $this->assertSame([$done->id, $backlog->id], Issue::where('status', 'backlog')->orderBy('sort_order')->pluck('id')->all());
    }
}
