<?php

namespace App\Enums;

enum StatusReserva: string
{
    case Ativa = 'ativa';
    case Convertida = 'convertida';
    case Expirada = 'expirada';
    case Cancelada = 'cancelada';
}
