<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subarea extends Model
{
    protected $fillable = ['area_id', 'nome', 'ordem'];

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function livros(): HasMany
    {
        return $this->hasMany(Livro::class);
    }
}
