<?php

namespace App\Models;

use App\Enums\StatusExemplar;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Livro extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'titulo',
        'subtitulo',
        'isbn',
        'ano',
        'editora',
        'sinopse',
        'cdd',
        'cdu'
    ];

    protected function casts(): array
    {
        return [
            'ano' => 'integer'
        ];
    }

    public function capaUrl(): ?string
    {
        return $this->capa_path ? Storage::disk('public')->url($this->capa_path) : null;
    }

    public function autores(): BelongsToMany
    {
        return $this->belongsToMany(Autor::class, 'autor_livro')->withPivot('ordem')->orderByPivot('ordem');
    }
}
