<?php

namespace App\Models;

use App\Enums\OrigemEmprestimo;
use App\Enums\StatusEmprestimo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Emprestimo extends Model
{
    protected $fillable = [
        'usuario_id',
        'exemplar_id',
        'reserva_id',
        'origem',
        'emprestado_por',
        'emprestado_em',
        'devolver_ate',
        'devolvido_em',
        'recebido_por',
    ];

    protected function casts(): array
    {
        return [
            'origem' => OrigemEmprestimo::class,
            'emprestado_em' => 'datetime',
            'devolver_ate' => 'datetime',
            'devolvido_em' => 'datetime',
        ];
    }

    public function status(): StatusEmprestimo
    {
        if ($this->devolvido_em !== null) {
            return StatusEmprestimo::Devolvido;
        }

        return now()->greaterThan($this->devolver_ate) ? StatusEmprestimo::Atrasado : StatusEmprestimo::Ativo;
    }

    public function diasRestantes(): ?int
    {
        if ($this->devolvido_em !== null) {
            return null;
        }

        return (int) now()->startOfDay()->diffInDays($this->devolver_ate->copy()->startOfDay(), false);
    }

    public function diasAtraso(): int
    {
        $referencia = $this->devolvido_em ?? now();
        if ($referencia->lessThanOrEqualTo($this->devolver_ate)) {
            return 0;
        }

        return max(1, (int) $this->devolver_ate->copy()->startOfDay()->diffInDays($referencia->copy()->startOfDay()));
    }

    public function scopeNaoDevolvidos(Builder $query): void
    {
        $query->whereNull('devolvido_em');
    }

    public function scopeAtivos(Builder $query): void
    {
        $query->whereNull('devolvido_em')->where('devolver_ate', '>=', now());
    }

    public function scopeAtrasados(Builder $query): void
    {
        $query->whereNull('devolvido_em')->where('devolver_ate', '<', now());
    }

    public function scopeDevolvidos(Builder $query): void
    {
        $query->whereNotNull('devolvido_em');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class);
    }

    public function exemplar(): BelongsTo
    {
        return $this->belongsTo(Exemplar::class);
    }

    public function reserva(): BelongsTo
    {
        return $this->belongsTo(Reserva::class);
    }

    public function emprestadoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'emprestado_por');
    }

    public function recebidoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'recebido_por');
    }
}
