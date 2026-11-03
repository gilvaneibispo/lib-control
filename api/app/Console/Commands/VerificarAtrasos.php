<?php

namespace App\Console\Commands;

use App\Services\BloqueioService;
use Illuminate\Console\Command;

class VerificarAtrasos extends Command
{
    protected $signature = 'emprestimos:verificar-atrasos';

    protected $description = 'Bloqueia leitores com empréstimo em atraso';

    public function handle(BloqueioService $bloqueios): int
    {
        $total = $bloqueios->bloquearAtrasados();
        $this->info("{$total} leitor(es) bloqueado(s).");

        return self::SUCCESS;
    }
}
