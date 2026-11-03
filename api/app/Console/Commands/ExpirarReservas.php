<?php

namespace App\Console\Commands;

use App\Services\ReservaService;
use Illuminate\Console\Command;

class ExpirarReservas extends Command
{
    protected $signature = 'reservas:expirar';

    protected $description = 'Expira reservas ativas vencidas e libera os exemplares';

    public function handle(ReservaService $reservas): int
    {
        $total = $reservas->expirarVencidas();
        $this->info("{$total} reserva(s) expirada(s).");

        return self::SUCCESS;
    }
}
