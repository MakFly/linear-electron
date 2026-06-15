<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IssueRelation extends Model
{
    protected $fillable = ['issue_id', 'related_issue_id', 'type'];

    public function issue(): BelongsTo
    {
        return $this->belongsTo(Issue::class);
    }

    public function relatedIssue(): BelongsTo
    {
        return $this->belongsTo(Issue::class, 'related_issue_id');
    }
}
