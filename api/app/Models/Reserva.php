<?php

namespace App\Models;

use App\Enums\StatusReserva;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reserva extends Model
{
    protected $fillable = ['usuario_id', 'livro_id', 'exemplar_id', 'status', 'expira_em', 'finalizada_em'];

    protected function casts(): array
    {
        return [
            'status' => StatusReserva::class,
            'expira_em' => 'datetime',
            'finalizada_em' => 'datetime',
        ];
    }

    public function scopeAtivas(Builder $query): void
    {
        $query->where('status', StatusReserva::Ativa);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class);
    }

    public function livro(): BelongsTo
    {
        return $this->belongsTo(Livro::class)->withTrashed();
    }

    public function exemplar(): BelongsTo
    {
        return $this->belongsTo(Exemplar::class);
    }
}
