<?php

namespace App\Services;

use App\Models\Area;
use App\Models\Subarea;
use Illuminate\Support\Facades\DB;

class AreaService
{
    public function inserir(array $dados): void
    {
        DB::transaction(function () use ($dados) {
            foreach ($dados as $dadosArea) {
                $area = Area::query()->updateOrCreate(
                    ['codigo' => $dadosArea['codigo']],
                    ['nome' => $dadosArea['nome'], 'ordem' => $dadosArea['codigo']],
                );

                foreach ($dadosArea['subareas'] as $indice => $nome) {
                    Subarea::query()->updateOrCreate(
                        ['area_id' => $area->id, 'nome' => $nome],
                        ['ordem' => $indice + 1],
                    );
                }
            }
        });
    }
}
