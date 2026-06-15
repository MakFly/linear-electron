<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = ['name', 'description', 'status', 'lead', 'start_date', 'target_date', 'icon', 'color'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'target_date' => 'date',
        ];
    }

    public function issues(): HasMany
    {
        return $this->hasMany(Issue::class);
    }
}
