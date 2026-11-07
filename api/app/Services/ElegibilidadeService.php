<?php

namespace App\Services;

use App\Enums\CodigoErro;
use App\Exceptions\RegrasException;
use App\Models\Emprestimo;
use App\Models\Reserva;
use App\Models\Usuario;

final class ElegibilidadeService
{
    public function avaliar(Usuario $leitor, ?int $livroId = null, ?Reserva $reservaEmConversao = null): ?CodigoErro
    {
        if ($leitor->isBloqueado()) {
            return CodigoErro::LeitorBloqueado;
        }

        if (Emprestimo::query()->where('usuario_id', $leitor->id)->atrasados()->exists()) {
            return CodigoErro::EmprestimoAtrasado;
        }

        $reservasAtivas = Reserva::query()->where('usuario_id', $leitor->id)->ativas()
            ->when($reservaEmConversao, fn($q) => $q->whereKeyNot($reservaEmConversao->id));

        $itens = (clone $reservasAtivas)->count()
            + Emprestimo::query()->where('usuario_id', $leitor->id)->naoDevolvidos()->count();
        if ($itens >= $this->limite()) {
            return CodigoErro::LimiteAtingido;
        }

        if ($livroId !== null) {
            $temReserva = (clone $reservasAtivas)->where('livro_id', $livroId)->exists();
            $temEmprestimo = Emprestimo::query()->where('usuario_id', $leitor->id)->naoDevolvidos()
                ->whereHas('exemplar', fn($q) => $q->where('livro_id', $livroId))
                ->exists();
            if ($temReserva || $temEmprestimo) {
                return CodigoErro::LivroJaComLeitor;
            }
        }

        return null;
    }

    public function verificar(Usuario $leitor, ?int $livroId = null, ?Reserva $reservaEmConversao = null): void
    {
        $codigo = $this->avaliar($leitor, $livroId, $reservaEmConversao);
        if ($codigo !== null) {
            throw new RegrasException($codigo);
        }
    }

    public function resumo(Usuario $leitor, ?int $livroId = null): array
    {
        $codigo = $this->avaliar($leitor, $livroId);

        return [
            'elegivel' => $codigo === null,
            'codigo' => $codigo?->value,
            'mensagem' => $codigo?->mensagem(),
            'itens_em_uso' => $this->itensEmUso($leitor),
            'limite' => $this->limite(),
        ];
    }

    public function itensEmUso(Usuario $leitor): int
    {
        $reservas = Reserva::query()
            ->where('usuario_id', $leitor->id)
            ->ativas()
            ->count();

        $emprestimos = Emprestimo::query()
            ->where('usuario_id', $leitor->id)
            ->naoDevolvidos()
            ->count();

        return $reservas + $emprestimos;
    }

    private function limite(): int
    {
        return (int) config('lib-control.limite_itens_por_leitor');
    }
}
