<?php

namespace App\Services;

use App\Enums\CodigoErro;
use App\Enums\StatusExemplar;
use App\Enums\StatusReserva;
use App\Exceptions\RegrasException;
use App\Models\Exemplar;
use App\Models\Reserva;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;

final class ReservaService
{
    public function __construct(private readonly ElegibilidadeService $elegibilidade) {}

    public function reservar(Usuario $leitor, int $livroId): Reserva
    {
        return DB::transaction(function () use ($leitor, $livroId) {
            $leitor = Usuario::query()->whereKey($leitor->id)->lockForUpdate()->firstOrFail();

            $this->elegibilidade->verificar($leitor, $livroId);

            $exemplar = Exemplar::query()
                ->where('livro_id', $livroId)
                ->where('status', StatusExemplar::Disponivel)
                ->orderBy('id')
                ->lock('for update skip locked')
                ->first();

            if ($exemplar === null) {
                throw new RegrasException(CodigoErro::SemExemplarDisponivel);
            }

            $exemplar->update(['status' => StatusExemplar::Reservado]);

            return Reserva::create([
                'usuario_id' => $leitor->id,
                'livro_id' => $livroId,
                'exemplar_id' => $exemplar->id,
                'status' => StatusReserva::Ativa,
                'expira_em' => now()->addDays((int) config('lib-control.reserva_dias'))->endOfDay(),
            ]);
        });
    }

    public function cancelar(Reserva $reserva): Reserva
    {
        return DB::transaction(function () use ($reserva) {
            $reserva = Reserva::query()->whereKey($reserva->id)->lockForUpdate()->firstOrFail();
            if ($reserva->status !== StatusReserva::Ativa) {
                throw new RegrasException(CodigoErro::ReservaNaoAtiva);
            }

            $this->finalizar($reserva, StatusReserva::Cancelada);

            return $reserva;
        });
    }

    public function expirarVencidas(): int
    {
        $ids = Reserva::query()->ativas()->where('expira_em', '<', now())->pluck('id');
        $expiradas = 0;

        foreach ($ids as $id) {
            $expiradas += DB::transaction(function () use ($id) {
                $reserva = Reserva::query()->whereKey($id)->lockForUpdate()->first();
                if ($reserva === null || $reserva->status !== StatusReserva::Ativa || $reserva->expira_em->isFuture()) {
                    return 0;
                }
                $this->finalizar($reserva, StatusReserva::Expirada);

                return 1;
            });
        }

        return $expiradas;
    }

    private function finalizar(Reserva $reserva, StatusReserva $status): void
    {
        $exemplar = Exemplar::query()->whereKey($reserva->exemplar_id)->lockForUpdate()->firstOrFail();

        $reserva->update(['status' => $status, 'finalizada_em' => now()]);

        if ($exemplar->status === StatusExemplar::Reservado) {
            $exemplar->update(['status' => StatusExemplar::Disponivel]);
        }
    }
}
