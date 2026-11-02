<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AreaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'nome' => $this->nome,
            'livros_count' => $this->whenCounted('livros'),
            'subareas' => SubareaResource::collection($this->whenLoaded('subareas')),
        ];
    }
}
