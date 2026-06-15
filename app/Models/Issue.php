<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Issue extends Model
{
    public const TEAM_PREFIX = 'DEV';

    protected $fillable = [
        'number',
        'sort_order',
        'title',
        'description',
        'status',
        'priority',
        'assignee',
        'project_id',
        'cycle_id',
        'parent_id',
        'due_date',
        'estimate',
        'started_at',
        'completed_at',
        'created_at',
    ];

    protected $appends = ['identifier', 'created_label'];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'due_date' => 'date:Y-m-d',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function getIdentifierAttribute(): string
    {
        return self::TEAM_PREFIX.'-'.$this->number;
    }

    public function getCreatedLabelAttribute(): string
    {
        return $this->created_at?->format('M j') ?? '';
    }

    public static function nextNumber(): int
    {
        return (int) self::max('number') + 1;
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class)->orderBy('name');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(Cycle::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('number');
    }

    public function relations(): HasMany
    {
        return $this->hasMany(IssueRelation::class);
    }
}
