<?php

namespace App\Models;

use App\Enums\Papel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{

    public const FOTO_PERFIL_PADRAO = '/profiles/foto-padrao.png';

    use HasFactory, Notifiable;

    protected $hidden = ['password'];
    protected $attributes = ['papel' => 'leitor'];
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

    public function fotoUrl(): ?string
    {
        return $this->foto_path ? storage_path($this->foto_path) : null;
    }
}
