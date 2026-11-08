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
            'area' => $this->whenLoaded('area', fn() => $this->area ? [
                'id' => $this->area->id,
                'codigo' => $this->area->codigo,
                'nome' => $this->area->nome,
            ] : null),
            'subarea' => $this->whenLoaded('subarea', fn() => $this->subarea ? [
                'id' => $this->subarea->id,
                'nome' => $this->subarea->nome,
            ] : null),
            'capa_url' => $this->capaUrl(),
            'capa_origem' => $this->capa_origem?->value,
            'autores' => $this->whenLoaded('autores', fn() => $this->autores->pluck('nome')->all()),
            'exemplares_total' => $this->whenHas('exemplares_total'),
            'exemplares_disponiveis' => $this->whenHas('exemplares_disponiveis'),
            'criado_em' => $this->created_at?->toIso8601String(),
        ];
    }
}
