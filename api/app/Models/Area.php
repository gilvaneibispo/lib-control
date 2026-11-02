<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Area extends Model
{
    protected $fillable = ['codigo', 'nome', 'ordem'];

    public function subareas(): HasMany
    {
        return $this->hasMany(Subarea::class)->orderBy('ordem');
    }

    public function livros(): HasMany
    {
        return $this->hasMany(Livro::class);
    }
}
