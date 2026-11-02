<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExemplarResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'livro_id' => $this->livro_id,
            'codigo' => $this->codigo,
            'status' => $this->status->value,
            'observacao' => $this->observacao,
            'livro' => $this->whenLoaded('livro', fn() => [
                'id' => $this->livro->id,
                'titulo' => $this->livro->titulo,
                'isbn' => $this->livro->isbn,
                'capa_url' => $this->livro->capaUrl(),
                'autores' => $this->livro->relationLoaded('autores') ? $this->livro->autores->pluck('nome')->all() : [],
            ]),
        ];
    }
}
