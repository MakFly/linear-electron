<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Label extends Model
{
    protected $fillable = ['name', 'color'];

    public function issues(): BelongsToMany
    {
        return $this->belongsToMany(Issue::class);
    }
}
