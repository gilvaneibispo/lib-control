<?php

namespace App\Models;

use App\Enums\Papel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $hidden = ['password'];
    protected $attributes = ['papel' => 'leitor'];
    protected $fillable = [
        'nome',
        'email',
        'password',
        'cpf',
        'nascimento',
        'cep',
        'uf',
        'cidade',
        'bairro',
        'rua',
        'numero',
        'complemento',
    ];

    protected function casts()
    {
        return [
            'password'   => 'hashed',
            'nascimento' => 'date',
            'papel'      => Papel::class,
        ];
    }

    public function isAdmin()
    {
        return $this->papel == Papel::Admin;
    }

    public function isLeitor()
    {
        return $this->papel == Papel::Leitor;
    }

    public function formatar()
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'email' => $this->email,
            'cpf' => $this->cpf,
            'nascimento' => $this->nascimento?->toDateString(),
            'cep' => $this->cep,
            'uf' => $this->uf,
            'cidade' => $this->cidade,
            'bairro' => $this->bairro,
            'rua' => $this->rua,
            'numero' => $this->numero,
            'complemento' => $this->complemento,
            'papel' => $this->papel->value,
            'criado_em' => $this->created_at?->toIso8601String(),
        ];
    }
}
