<?php

namespace App\Services;

use App\Enums\CodigoErro;
use App\Exceptions\RegrasException;
use App\Models\Emprestimo;
use App\Models\Usuario;

final class BloqueioService
{
    public function bloquear(Usuario $leitor, string $motivo, bool $automatico = false): Usuario
    {
        if ($leitor->isBloqueado()) {
            throw new RegrasException(CodigoErro::LeitorJaBloqueado);
        }

        $leitor->forceFill([
            'bloqueado_em' => now(),
            'motivo_bloqueio' => $motivo,
            'bloqueio_automatico' => $automatico,
        ])->save();

        return $leitor;
    }

    public function bloquearAtrasados(): int
    {
        $bloqueados = 0;

        Emprestimo::query()->atrasados()
            ->whereHas('usuario', fn($q) => $q->whereNull('bloqueado_em'))
            ->with('usuario')
            ->orderBy('devolver_ate')
            ->each(function (Emprestimo $emprestimo) use (&$bloqueados) {
                $leitor = $emprestimo->usuario->refresh();
                if ($leitor->isBloqueado()) {
                    return;
                }
                $this->bloquear($leitor, "Empréstimo #{$emprestimo->id} em atraso", automatico: true);
                $bloqueados++;
            });

        return $bloqueados;
    }

    public function desbloquearSeQuitado(Usuario $leitor): bool
    {
        if (
            !config('lib-control.desbloqueio_automatico')
            || !$leitor->isBloqueado()
            || !$leitor->bloqueio_automatico
        ) {
            return false;
        }

        if (Emprestimo::query()->where('usuario_id', $leitor->id)->atrasados()->exists()) {
            return false;
        }

        $leitor->forceFill([
            'bloqueado_em' => null,
            'motivo_bloqueio' => null,
            'bloqueio_automatico' => false,
        ])->save();

        return true;
    }
}
