<?php

namespace App\Http\Controllers\Leitor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection as Anonimos;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmprestimoResource;
use App\Http\Resources\ReservaResource;

class MeController extends Controller
{
    public function reservas(Request $request): Anonimos
    {
        $reservas = $request->user()->reservas()
            ->with(['livro.autores', 'exemplar'])
            ->orderByRaw("case when status = 'ativa' then 0 else 1 end")
            ->latest('id')
            ->paginate(config('lib-control.por_pagina'));

        return ReservaResource::collection($reservas);
    }

    public function emprestimos(Request $request): Anonimos
    {
        $emprestimos = $request->user()->emprestimos()
            ->with(['exemplar.livro.autores'])
            ->orderByRaw('case when devolvido_em is null then 0 else 1 end')
            ->orderBy('devolver_ate')
            ->latest('id')
            ->paginate(config('lib-control.por_pagina'));

        return EmprestimoResource::collection($emprestimos);
    }
}
