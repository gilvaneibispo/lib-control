<?php

namespace App\Http\Controllers\Leitor;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReservarRequest;
use App\Http\Resources\ReservaResource;
use App\Models\Reserva;
use App\Services\ReservaService;

class ReservaController extends Controller
{
    public function __construct(private readonly ReservaService $reservas) {}

    public function store(ReservarRequest $request): JsonResponse
    {
        $reserva = $this->reservas->reservar($request->user(), $request->integer('livro_id'));

        return (new ReservaResource($reserva->load(['livro.autores', 'exemplar'])))
            ->response()
            ->setStatusCode(201);
    }

    public function cancelar(Request $request, Reserva $reserva): ReservaResource
    {
        abort_unless($reserva->usuario_id === $request->user()->id, 404);

        return new ReservaResource($this->reservas->cancelar($reserva)->load(['livro.autores', 'exemplar']));
    }
}
