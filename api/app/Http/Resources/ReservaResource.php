<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'expira_em' => $this->expira_em->toIso8601String(),
            'finalizada_em' => $this->finalizada_em?->toIso8601String(),
            'criada_em' => $this->created_at?->toIso8601String(),
            'livro' => new LivroResource($this->whenLoaded('livro')),
            'exemplar' => $this->whenLoaded('exemplar', fn() => [
                'id' => $this->exemplar->id,
                'codigo' => $this->exemplar->codigo,
            ]),
            'leitor' => $this->whenLoaded('usuario', fn() => LeitorResumoResource::make($this->usuario)),
        ];
    }
}
