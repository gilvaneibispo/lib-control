<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\JsonResponse;

use App\Enums\Papel;
use App\Http\Controllers\Controller;
use App\Http\Resources\EmprestimoResource;
use App\Http\Resources\ReservaResource;
use App\Models\Emprestimo;
use App\Models\Reserva;
use App\Models\Usuario;

class DashboardController extends Controller
{
    private const LIMITE_LISTAS = 8;

    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'contadores' => $this->contadores(),
                'retiradas_pendentes' => ReservaResource::collection($this->retiradasPendentes()),
                'atrasados' => EmprestimoResource::collection($this->atrasados()),
            ],
        ]);
    }

    private function contadores(): array
    {
        $hoje = [now()->startOfDay(), now()->endOfDay()];

        $reservasARetirar = Reserva::query()
            ->ativas()
            ->where('expira_em', '>=', now())
            ->count();

        $reservasVencemHoje = Reserva::query()
            ->ativas()
            ->whereBetween('expira_em', $hoje)
            ->count();

        $leitoresBloqueados = Usuario::query()
            ->where('papel', Papel::Leitor)
            ->whereNotNull('bloqueado_em')
            ->count();

        return [
            'reservas_a_retirar' => $reservasARetirar,
            'reservas_vencem_hoje' => $reservasVencemHoje,
            'emprestimos_ativos' => Emprestimo::query()->ativos()->count(),
            'emprestimos_atrasados' => Emprestimo::query()->atrasados()->count(),
            'leitores_bloqueados' => $leitoresBloqueados,
        ];
    }

    private function retiradasPendentes()
    {
        return Reserva::query()
            ->ativas()
            ->where('expira_em', '>=', now())
            ->with(['livro.autores', 'exemplar', 'usuario'])
            ->orderBy('expira_em')
            ->limit(self::LIMITE_LISTAS)
            ->get();
    }

    private function atrasados()
    {
        return Emprestimo::query()
            ->atrasados()
            ->with(['exemplar.livro.autores', 'usuario'])
            ->orderBy('devolver_ate')
            ->limit(self::LIMITE_LISTAS)
            ->get();
    }
}
