<?php

namespace App\Http\Controllers\Admin;

// Classes do Laravel...
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection as Anonimos;

// Classes do projeto...
use App\Http\Controllers\Controller;
use App\Http\Requests\EmprestimoBalcaoRequest;
use App\Http\Resources\EmprestimoResource;
use App\Models\Emprestimo;
use App\Models\Usuario;
use App\Services\EmprestimoService;

class EmprestimoController extends Controller
{
    public function __construct(private readonly EmprestimoService $emprestimos) {}

    public function index(Request $request): Anonimos
    {
        $request->validate([
            'status' => ['nullable', 'in:ativo,atrasado,devolvido'],
            'q' => ['nullable', 'string', 'max:200'],
        ]);

        $status = $request->input('status');
        $termo = trim($request->string('q')->toString());

        $emprestimos = Emprestimo::query()
            ->with(['exemplar.livro.autores', 'usuario', 'emprestadoPor', 'recebidoPor'])
            ->when($status === 'ativo', fn($q) => $q->ativos())
            ->when($status === 'atrasado', fn($q) => $q->atrasados())
            ->when($status === 'devolvido', fn($q) => $q->devolvidos())
            ->when($termo !== '', fn($q) => $this->filtrarPorTermo($q, $termo))
            ->when(
                $status === 'devolvido',
                fn($q) => $q->latest('devolvido_em'),
                fn($q) => $q->orderBy('devolver_ate'),
            )
            ->paginate(config('lib-control.por_pagina'))
            ->withQueryString();

        return EmprestimoResource::collection($emprestimos);
    }

    public function store(EmprestimoBalcaoRequest $request): JsonResponse
    {
        $usuarioId = $request->integer('usuario_id');
        $exemplarId = $request->integer('exemplar_id');
        $admin = $request->user();

        $leitor = Usuario::query()->findOrFail($usuarioId);
        $emprestimo = $this->emprestimos->emprestarBalcao($leitor, $exemplarId, $admin);

        return (new EmprestimoResource($emprestimo->load(['exemplar.livro.autores', 'usuario'])))
            ->response()
            ->setStatusCode(201);
    }

    public function devolver(Request $request, Emprestimo $emprestimo): EmprestimoResource
    {
        $resultado = $this->emprestimos->devolver($emprestimo, $request->user());
        $emprestimo = $resultado['emprestimo']
            ->load([
                'exemplar.livro.autores',
                'usuario',
                'recebidoPor'
            ]);

        return (new EmprestimoResource($emprestimo))->additional([
            'dias_atraso' => $resultado['dias_atraso'],
            'leitor_desbloqueado' => $resultado['leitor_desbloqueado'],
        ]);
    }

    private function filtrarPorTermo(Builder $emprestimos, string $termo): void
    {
        $emprestimos->where(function (Builder $busca) use ($termo) {
            $busca
                ->whereHas('usuario', fn(Builder $leitor) => $this->filtrarLeitor($leitor, $termo))
                ->orWhereHas('exemplar', fn(Builder $exemplar) => $this->filtrarExemplar($exemplar, $termo));
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

    private function filtrarExemplar(Builder $exemplar, string $termo): void
    {
        $exemplar
            ->where('codigo', 'ilike', "{$termo}%")
            ->orWhereHas('livro', fn(Builder $livro) => $livro->busca($termo));
    }
}
