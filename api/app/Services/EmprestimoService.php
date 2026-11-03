<?php

namespace App\Services;

use App\Enums\CodigoErro;
use App\Enums\OrigemEmprestimo;
use App\Enums\StatusExemplar;
use App\Enums\StatusReserva;
use App\Exceptions\RegrasException;
use App\Models\Emprestimo;
use App\Models\Exemplar;
use App\Models\Reserva;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;

final class EmprestimoService
{
    public function __construct(
        private readonly ElegibilidadeService $elegibilidade,
        private readonly BloqueioService $bloqueios,
    ) {}

    public function retirar(Reserva $reserva, Usuario $admin): Emprestimo
    {
        return DB::transaction(function () use ($reserva, $admin) {
            $reserva = Reserva::query()->whereKey($reserva->id)->lockForUpdate()->firstOrFail();
            if ($reserva->status !== StatusReserva::Ativa || $reserva->expira_em->isPast()) {
                throw new RegrasException(CodigoErro::ReservaNaoAtiva);
            }

            $leitor = Usuario::query()->whereKey($reserva->usuario_id)->lockForUpdate()->firstOrFail();
            $this->elegibilidade->verificar($leitor, $reserva->livro_id, $reserva);

            $exemplar = Exemplar::query()->whereKey($reserva->exemplar_id)->lockForUpdate()->firstOrFail();
            $exemplar->update(['status' => StatusExemplar::Emprestado]);

            $reserva->update(['status' => StatusReserva::Convertida, 'finalizada_em' => now()]);

            return $this->criarEmprestimo($leitor, $exemplar, $admin, OrigemEmprestimo::Reserva, $reserva);
        });
    }

    public function emprestarBalcao(Usuario $leitor, int $exemplarId, Usuario $admin): Emprestimo
    {
        if (!$leitor->isLeitor()) {
            throw new RegrasException(CodigoErro::UsuarioNaoLeitor);
        }

        return DB::transaction(function () use ($leitor, $exemplarId, $admin) {
            $leitor = Usuario::query()->whereKey($leitor->id)->lockForUpdate()->firstOrFail();
            $exemplar = Exemplar::query()->whereKey($exemplarId)->lockForUpdate()->firstOrFail();

            $this->elegibilidade->verificar($leitor, $exemplar->livro_id);

            if ($exemplar->status !== StatusExemplar::Disponivel) {
                throw new RegrasException(CodigoErro::ExemplarIndisponivel);
            }

            $exemplar->update(['status' => StatusExemplar::Emprestado]);

            return $this->criarEmprestimo($leitor, $exemplar, $admin, OrigemEmprestimo::Balcao);
        });
    }

    public function devolver(Emprestimo $emprestimo, Usuario $admin): array
    {
        return DB::transaction(function () use ($emprestimo, $admin) {
            $emprestimo = Emprestimo::query()->whereKey($emprestimo->id)->lockForUpdate()->firstOrFail();
            if ($emprestimo->devolvido_em !== null) {
                throw new RegrasException(CodigoErro::EmprestimoJaDevolvido);
            }

            $exemplar = Exemplar::query()->whereKey($emprestimo->exemplar_id)->lockForUpdate()->firstOrFail();

            $emprestimo->update(['devolvido_em' => now(), 'recebido_por' => $admin->id]);
            $exemplar->update(['status' => StatusExemplar::Disponivel]);

            $leitor = Usuario::query()->whereKey($emprestimo->usuario_id)->lockForUpdate()->firstOrFail();
            $desbloqueado = $this->bloqueios->desbloquearSeQuitado($leitor);

            return [
                'emprestimo' => $emprestimo,
                'dias_atraso' => $emprestimo->diasAtraso(),
                'leitor_desbloqueado' => $desbloqueado,
            ];
        });
    }

    private function criarEmprestimo(
        Usuario $leitor,
        Exemplar $exemplar,
        Usuario $admin,
        OrigemEmprestimo $origem,
        ?Reserva $reserva = null,
    ): Emprestimo {
        return Emprestimo::create([
            'usuario_id' => $leitor->id,
            'exemplar_id' => $exemplar->id,
            'reserva_id' => $reserva?->id,
            'origem' => $origem,
            'emprestado_por' => $admin->id,
            'emprestado_em' => now(),
            'devolver_ate' => now()->addDays((int) config('lib-control.emprestimo_dias'))->endOfDay(),
        ]);
    }
}
