<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LivroResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'subtitulo' => $this->subtitulo,
            'isbn' => $this->isbn,
            'ano' => $this->ano,
            'editora' => $this->editora,
            'sinopse' => $this->sinopse,
            'cdd' => $this->cdd,
            'cdu' => $this->cdu,
            'capa_url' => $this->capaUrl(),
            'autores' => $this->whenLoaded('autores', fn() => $this->autores->pluck('nome')->all()),
            'criado_em' => $this->created_at?->toIso8601String(),
        ];
    }
}
