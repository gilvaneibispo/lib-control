<?php

namespace App\Models;

use App\Enums\StatusExemplar;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'cdu',
        'area_id',
        'subarea_id'
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

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function subarea(): BelongsTo
    {
        return $this->belongsTo(Subarea::class);
    }

    public function exemplares(): HasMany
    {
        return $this->hasMany(Exemplar::class)->orderBy('id');
    }

    public function scopeBusca(Builder $query, ?string $termo): void
    {
        $termo = trim((string) $termo);
        if ($termo === '') {
            return;
        }

        $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $termo) . '%';
        $isbn = preg_replace('/[^0-9Xx]/', '', $termo);

        $query->where(function (Builder $q) use ($like, $isbn) {
            $q->where('titulo', 'ilike', $like)
                ->orWhere('subtitulo', 'ilike', $like)
                ->orWhereHas('autores', fn(Builder $a) => $a->where('nome', 'ilike', $like));
            if ($isbn !== null && strlen($isbn) >= 4) {
                $q->orWhere('isbn', 'like', '%' . $isbn . '%');
            }
        });
    }
}
