<?php

namespace App\Http\Controllers\Admin;

// Classes do Laravel...
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection as Anonimos;

// Classes do projeto...
use App\Http\Controllers\Controller;
use App\Http\Resources\EmprestimoResource;
use App\Http\Resources\ReservaResource;
use App\Models\Reserva;
use App\Services\EmprestimoService;
use App\Services\ReservaService;

class ReservaController extends Controller
{
    public function __construct(
        private readonly ReservaService $reservas,
        private readonly EmprestimoService $emprestimos,
    ) {}

    public function index(Request $request): Anonimos
    {
        $request->validate([
            'status' => ['nullable', 'in:ativa,convertida,expirada,cancelada,todas'],
            'q' => ['nullable', 'string', 'max:200'],
        ]);

        $status = $request->input('status', 'ativa');
        $termo = trim($request->string('q')->toString());

        $reservas = Reserva::query()
            ->with(['livro.autores', 'exemplar', 'usuario'])
            ->when($status !== 'todas', fn($q) => $q->where('status', $status))
            ->when($termo !== '', fn($q) => $this->filtrarPorTermo($q, $termo))
            ->when($status === 'ativa', fn($q) => $q->orderBy('expira_em'), fn($q) => $q->latest('id'))
            ->paginate(config('lib-control.por_pagina'))
            ->withQueryString();

        return ReservaResource::collection($reservas);
    }

    public function retirar(Request $request, Reserva $reserva): JsonResponse
    {
        $emprestimo = $this->emprestimos->retirar($reserva, $request->user());

        return (new EmprestimoResource($emprestimo->load(['exemplar.livro.autores', 'usuario'])))
            ->response()
            ->setStatusCode(201);
    }

    public function cancelar(Reserva $reserva): ReservaResource
    {
        $cancelada = $this->reservas
            ->cancelar($reserva)
            ->load([
                'livro.autores',
                'exemplar',
                'usuario'
            ]);

        return new ReservaResource($cancelada);
    }

    private function filtrarPorTermo(Builder $reservas, string $termo): void
    {
        $reservas->where(function (Builder $busca) use ($termo) {
            $busca
                ->whereHas('usuario', fn(Builder $leitor) => $this->filtrarLeitor($leitor, $termo))
                ->orWhereHas('livro', fn(Builder $livro) => $livro->busca($termo));
        });
    }

    private function filtrarLeitor(Builder $leitor, string $termo): void
    {
        $cpf = preg_replace('/\D/', '', $termo);

        $leitor
            ->where('nome', 'ilike', "%{$termo}%")
            ->orWhere('email', 'ilike', "%{$termo}%");

        if (strlen($cpf) >= 3) {
            $leitor->orWhere('cpf', 'like', "%{$cpf}%");
        }
    }
}
