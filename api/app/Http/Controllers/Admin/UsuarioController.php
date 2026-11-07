<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection as Anonimos;

use App\Http\Controllers\Controller;
use App\Http\Requests\AtualizarUsuarioRequest;
use App\Http\Requests\MotivoRequest;
use App\Http\Resources\EmprestimoResource;
use App\Http\Resources\ReservaResource;
use App\Http\Resources\UsuarioResource;
use App\Models\Usuario;
use App\Services\BloqueioService;
use App\Services\ElegibilidadeService;

class UsuarioController extends Controller
{
    private const LIMITE_HISTORICO = 50;

    public function __construct(
        private readonly BloqueioService $bloqueios,
        private readonly ElegibilidadeService $elegibilidade,
    ) {}

    public function index(Request $request): Anonimos
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:200'],
            'papel' => ['nullable', 'in:leitor,admin'],
            'bloqueado' => ['nullable', 'boolean'],
        ]);

        $termo = trim($request->string('q')->toString());

        $usuarios = Usuario::query()
            ->withCount(['reservasAtivas', 'emprestimosNaoDevolvidos'])
            ->when($termo !== '', fn($q) => $this->filtrarPorTermo($q, $termo))
            ->when($request->filled('papel'), fn($q) => $q->where('papel', $request->input('papel')))
            ->when($request->boolean('bloqueado'), fn($q) => $q->whereNotNull('bloqueado_em'))
            ->orderBy('nome')
            ->paginate(config('lib-control.por_pagina'))
            ->withQueryString();

        return UsuarioResource::collection($usuarios);
    }

    public function show(Usuario $usuario): UsuarioResource
    {
        $usuario->loadCount(['reservasAtivas', 'emprestimosNaoDevolvidos']);

        $reservas = $usuario->reservas()
            ->with(['livro.autores', 'exemplar'])
            ->latest('id')
            ->limit(self::LIMITE_HISTORICO)
            ->get();

        $emprestimos = $usuario->emprestimos()
            ->with(['exemplar.livro.autores', 'emprestadoPor', 'recebidoPor'])
            ->latest('id')
            ->limit(self::LIMITE_HISTORICO)
            ->get();

        $elegibilidade = $usuario->isLeitor()
            ? $this->elegibilidade->resumo($usuario)
            : null;

        return (new UsuarioResource($usuario))->additional([
            'elegibilidade' => $elegibilidade,
            'reservas' => ReservaResource::collection($reservas),
            'emprestimos' => EmprestimoResource::collection($emprestimos),
        ]);
    }

    public function update(AtualizarUsuarioRequest $request, Usuario $usuario): UsuarioResource
    {
        $usuario->fill($request->validated());
        $usuario->save();

        return new UsuarioResource($usuario);
    }

    public function bloquear(MotivoRequest $request, Usuario $usuario): UsuarioResource
    {
        $motivo = (string) $request->input('motivo');
        $bloqueado = $this->bloqueios->bloquear($usuario, $motivo);

        return new UsuarioResource($bloqueado);
    }

    public function desbloquear(MotivoRequest $request, Usuario $usuario): UsuarioResource
    {
        $motivo = (string) $request->input('motivo');
        $desbloqueado = $this->bloqueios->desbloquear($usuario, $motivo, $request->user());

        return new UsuarioResource($desbloqueado);
    }

    private function filtrarPorTermo(Builder $usuarios, string $termo): void
    {
        $cpf = preg_replace('/\D/', '', $termo);

        $usuarios->where(function (Builder $busca) use ($termo, $cpf) {
            $busca
                ->where('nome', 'ilike', "%{$termo}%")
                ->orWhere('email', 'ilike', "%{$termo}%");

            if (strlen($cpf) >= 3) {
                $busca->orWhere('cpf', 'like', "%{$cpf}%");
            }
        });
    }
}
