<?php

namespace App\Models;

use App\Enums\Papel;
use App\Enums\StatusReserva;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class Usuario extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $hidden = ['password'];
    protected $attributes = ['papel' => 'leitor', 'bloqueio_automatico' => false];
    protected $fillable = [
        'nome',
        'email',
        'password',
        'cpf',
        'data_nascimento',
        'foto_path',
        'cep',
        'uf',
        'cidade',
        'bairro',
        'rua',
        'numero',
        'complemento',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'data_nascimento' => 'date',
            'papel' => Papel::class,
            'bloqueado_em' => 'datetime',
            'bloqueio_automatico' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->papel === Papel::Admin;
    }

    public function isLeitor(): bool
    {
        return $this->papel === Papel::Leitor;
    }

    public function isBloqueado(): bool
    {
        return $this->bloqueado_em !== null;
    }

    public function fotoUrl(): ?string
    {
        return $this->foto_path ? Storage::disk('public')->url($this->foto_path) : null;
    }

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }

    public function reservasAtivas(): HasMany
    {
        return $this->reservas()->where('status', StatusReserva::Ativa);
    }

    public function emprestimos(): HasMany
    {
        return $this->hasMany(Emprestimo::class);
    }

    public function emprestimosNaoDevolvidos(): HasMany
    {
        return $this->emprestimos()->whereNull('devolvido_em');
    }
}
