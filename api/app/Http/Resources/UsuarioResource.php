<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'email' => $this->email,
            'cpf' => $this->cpf,
            'data_nascimento' => $this->data_nascimento?->toDateString(),
            'foto_url' => $this->fotoUrl(),
            'cep' => $this->cep,
            'uf' => $this->uf,
            'cidade' => $this->cidade,
            'bairro' => $this->bairro,
            'rua' => $this->rua,
            'numero' => $this->numero,
            'complemento' => $this->complemento,
            'papel' => $this->papel->value,
            'criado_em' => $this->created_at?->toIso8601String()
        ];
    }
}
