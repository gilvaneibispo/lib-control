<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmprestimoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'origem' => $this->origem->value,
            'status' => $this->status()->value,
            'dias_restantes' => $this->diasRestantes(),
            'dias_atraso' => $this->diasAtraso(),
            'emprestado_em' => $this->emprestado_em->toIso8601String(),
            'devolver_ate' => $this->devolver_ate->toIso8601String(),
            'devolvido_em' => $this->devolvido_em?->toIso8601String(),
            'exemplar' => new ExemplarResource($this->whenLoaded('exemplar')),
            'leitor' => $this->whenLoaded('usuario', fn() => LeitorResumoResource::make($this->usuario)),
            'emprestado_por' => $this->whenLoaded('emprestadoPor', fn() => $this->emprestadoPor?->nome),
            'recebido_por' => $this->whenLoaded('recebidoPor', fn() => $this->recebidoPor?->nome),
        ];
    }
}
